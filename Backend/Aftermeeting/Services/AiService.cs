using Aftermeeting.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aftermeeting.Services
{
    public class AiService
    {
        private readonly HttpClient _http;
        private const string BaseUrl = "http://127.0.0.1:8000/api/v1";

        public AiService(HttpClient http)
        {
            _http = http;
        }

        // ==================
        // تحليل النص
        // ==================
        public async Task<AiResult> ProcessAsync(string transcript)
        {
            var body = JsonSerializer.Serialize(new { transcript });
            var content = new StringContent(body, Encoding.UTF8, "application/json");

            var response = await _http.PostAsync($"{BaseUrl}/meetings/analyze", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AnalyzeResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return new AiResult
            {
                Title = result!.Title ?? "اجتماع جديد",
                Summary = result?.Summary ?? result?.Analysis ?? "",
                Participants = result.Attendees ?? new List<string>(),
                Tasks = new List<AiTask>()
            };
        }

        // ==================
        // رفع Audio
        // ==================
        public async Task<string> TranscribeAudioAsync(string audioFilePath)
        {
            using var form = new MultipartFormDataContent();
            var fileBytes = await File.ReadAllBytesAsync(audioFilePath);
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("audio/mpeg");
            form.Add(fileContent, "file", Path.GetFileName(audioFilePath));

            var response = await _http.PostAsync($"{BaseUrl}/meetings/upload-audio", form);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<TranscribeResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.CleanedText ?? result?.Transcript ?? "";
        }

        // ==================
        // رفع Text
        // ==================
        public async Task<string> UploadTextAsync(string text)
        {
            var body = JsonSerializer.Serialize(new { text });
            var content = new StringContent(body, Encoding.UTF8, "application/json");

            var response = await _http.PostAsync($"{BaseUrl}/meetings/upload-text", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<TranscribeResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.CleanedText ?? result?.Transcript ?? "";
        }

        // ==================
        // Semantic Search
        // ==================
        public async Task<SearchResponse> SemanticSearchAsync(string query, List<SearchDocument> documents, int topK = 5, string? speaker = null, string? date = null, string? title = null)
        {
            var payload = new
            {
                query = query,
                top_k = topK,
                documents = documents.Select(d => new
                {
                    id = d.Id?.ToString() ?? Guid.NewGuid().ToString(), 
                    title = d.Title ?? "Untitled",

                    text = d.Text ?? "No Content",

                    date = DateTime.UtcNow.ToString("yyyy-MM-dd"),

                    speakers = new List<string> { speaker ?? "Unknown" }
                }).ToList()
            };
            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _http.PostAsync($"{BaseUrl}/search/", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"AI Server Error (422): {errorContent}");
                throw new HttpRequestException($"AI Server returned {response.StatusCode}: {errorContent}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            };

            return JsonSerializer.Deserialize<SearchResponse>(jsonResponse, options)!;
        }
    }
        // ==================
        // Response Models
        // ==================
        public class AnalyzeResponse
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("summary")]
        public string? Summary { get; set; }

        [JsonPropertyName("analysis")]
        public string? Analysis { get; set; }

        [JsonPropertyName("attendees")]
        public List<string>? Attendees { get; set; }
    }

    public class TranscribeResponse
    {
        public string? Transcript { get; set; }

        [JsonPropertyName("cleaned_text")]
        public string? CleanedText { get; set; }

        [JsonPropertyName("speaker_roles")]
        public Dictionary<string, string>? SpeakerRoles { get; set; }
    }

    public class AiResult
    {
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<string> Participants { get; set; } = new();
        public List<AiTask> Tasks { get; set; } = new();
    }

    public class AiTask
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Priority { get; set; } = "Medium";
    }

    public class SearchDocument
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string? Date { get; set; }
        public List<string> Speakers { get; set; } = new();
    }

    public class SearchResponse
    {
        public List<SearchResult> Results { get; set; } = new();
    }

    public class SearchResult
    {
        public double Score { get; set; }

        [JsonPropertyName("document_id")]
        public string DocumentId { get; set; } = string.Empty;

        [JsonPropertyName("meeting_title")]
        public string MeetingTitle { get; set; } = string.Empty;

        [JsonPropertyName("meeting_date")]
        public string MeetingDate { get; set; } = string.Empty;

        public List<string> Speakers { get; set; } = new();
        public string Snippet { get; set; } = string.Empty;
    }
}