import re
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from openai import OpenAI

import config
from models.schemas import SearchDocument, SearchResultItem

# Initialize OpenAI
client = OpenAI(api_key=config.OPENAI_API_KEY)

MODEL_NAME = "intfloat/multilingual-e5-base"
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading embedding model for stateless search...")
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def normalize_arabic(text: str) -> str:
    text = text.strip().lower()
    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ة", "ه", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "و", text)
    text = re.sub("ئ", "ي", text)
    return text

def extract_snippet_from_chunk(full_text: str, original_query: str) -> str:
    sentences = re.split(r'(?<=[.!؟\n])\s+', full_text)
    query_words = normalize_arabic(original_query).split()
    best_sentence = None
    max_matches = 0
    for sentence in sentences:
        sentence_norm = normalize_arabic(sentence)
        match_count = sum(1 for word in query_words if word in sentence_norm)
        if match_count > max_matches:
            max_matches = match_count
            best_sentence = sentence
    if best_sentence:
        return best_sentence.strip()
    return sentences[0].strip() if sentences else ""

def intelligent_query_processing(query: str) -> str:
    ARABIC_STOPWORDS = {"في", "من", "على", "الى", "عن", "مع", "جدا", "خالص", "قوي", "اوي", "هو", "هي", "ده", "دي", "مش", "ما", "مفيش"}
    q = normalize_arabic(query)
    words = q.split()
    keywords = [w for w in words if w not in ARABIC_STOPWORDS]
    expansion_map = {
        "حلو": ["جوده", "تحسين"],
        "سيء": ["مشاكل", "ضعف"],
        "ضعيف": ["مشاكل", "اداء"],
        "باظ": ["مشكله", "خلل"]
    }
    expanded = list(keywords)
    for word in keywords:
        for key in expansion_map:
            if key in word:
                expanded.extend(expansion_map[key])
    return " ".join(set(expanded))

def rewrite_query(query: str) -> str:
    prompt = f"""
أنت خبير في تحسين استعلامات البحث داخل مستندات الاجتماعات.
المطلوب:
- افهم معنى السؤال كويس
- استخرج الكلمات المفتاحية المهمة
- لو فيه عامية، حولها لمصطلحات واضحة
- ممكن توسّع المعنى بكلمات قريبة (synonyms)
- خليه مناسب للبحث الدلالي
مهم جداً:
- لا تشرح
- لا تكتب جمل طويلة
- اكتب فقط query محسّن قصير
- استخدم كلمات مفتاحية فقط

السؤال:
{query}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "أنت خبير semantic search و NLP."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        rewritten = response.choices[0].message.content.strip()
        return rewritten if rewritten else query
    except:
        return query

def rerank_results(query: str, documents: list) -> list:
    docs_text = "\n\n".join([f"{i}. {doc[:300]}" for i, doc in enumerate(documents)])
    prompt = f"""
رتّب النصوص التالية حسب مدى ارتباطها بالسؤال.
السؤال:
{query}
النصوص:
{docs_text}
ارجع فقط أرقام النصوص مرتبة من الأفضل للأسوأ
مثال:
[2, 0, 1]
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        output = response.choices[0].message.content.strip()
        ranking = json.loads(output)
        return ranking
    except Exception as e:
        print(f"Reranking error: {e}")
        return list(range(len(documents)))

def stateless_search(
    query: str, 
    documents: list[SearchDocument], 
    top_k: int = 5, 
    speaker: str = None, 
    date: str = None, 
    title: str = None
) -> list[SearchResultItem]:
    
    if not query.strip() or not documents:
        return []
        
    model = get_model()
    
    # 1. Filter documents FIRST based on metadata
    filtered_docs = documents
    if speaker:
        speaker_norm = normalize_arabic(speaker)
        filtered_docs = [
            d for d in filtered_docs 
            if any(speaker_norm in normalize_arabic(s) for s in (d.speakers or []))
        ]
    if date:
        filtered_docs = [d for d in filtered_docs if d.date and d.date.startswith(date)]
    if title:
        title_norm = normalize_arabic(title)
        filtered_docs = [d for d in filtered_docs if title_norm in normalize_arabic(d.title)]
        
    if not filtered_docs:
        return []

    # 2. Chunk documents dynamically
    chunks = []
    chunk_meta = []
    
    for doc in filtered_docs:
        sentences = re.split(r'(?<=[.!؟\n])\s+', doc.text)
        current_chunk = []
        current_length = 0
        for s in sentences:
            if not s.strip(): continue
            words = s.split()
            if current_length + len(words) > 150:
                chunk_text = " ".join(current_chunk)
                chunks.append("passage: " + chunk_text)
                chunk_meta.append({"doc": doc, "chunk_text": chunk_text})
                current_chunk = words
                current_length = len(words)
            else:
                current_chunk.extend(words)
                current_length += len(words)
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunks.append("passage: " + chunk_text)
            chunk_meta.append({"doc": doc, "chunk_text": chunk_text})

    if not chunks:
        return []

    # 3. Embed query and chunks
    smart_query = intelligent_query_processing(query)
    rewritten_query = rewrite_query(smart_query)
    formatted_query = "query: " + rewritten_query
    
    query_embedding = model.encode(formatted_query, convert_to_numpy=True, normalize_embeddings=True)
    chunk_embeddings = model.encode(chunks, convert_to_numpy=True, normalize_embeddings=True)
    
    # 4. Cosine similarity
    scores = np.dot(chunk_embeddings, query_embedding)
    
    # 5. Top K chunks (before reranking)
    top_indices = np.argsort(scores)[::-1][:min(top_k * 5, len(chunks))]
    
    candidates = []
    for idx in top_indices:
        candidates.append({
            "score": float(scores[idx]),
            "text": chunk_meta[idx]["chunk_text"],
            "meta": chunk_meta[idx]["doc"]
        })
        
    # 6. Rerank
    docs_for_rerank = [c["text"] for c in candidates]
    ranking = rerank_results(query, docs_for_rerank)
    
    # Safely reorder candidates
    valid_ranking = [r for r in ranking if r < len(candidates)]
    # Add any missing indices at the end just in case LLM missed some
    for i in range(len(candidates)):
        if i not in valid_ranking:
            valid_ranking.append(i)
            
    reranked = [candidates[i] for i in valid_ranking][:top_k]
    
    # 7. Format results
    results = []
    for item in reranked:
        doc = item["meta"]
        snippet = extract_snippet_from_chunk(item["text"], query)
        results.append(SearchResultItem(
            score=item["score"],
            document_id=doc.id,
            meeting_title=doc.title,
            meeting_date=doc.date or "",
            speakers=doc.speakers or [],
            snippet=snippet
        ))
        
    return results
