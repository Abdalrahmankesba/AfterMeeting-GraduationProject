using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Aftermeeting.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AiService _ai;

        public SearchController(AppDbContext db, AiService ai)
        {
            _db = db;
            _ai = ai;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        [HttpGet]
        public async Task<IActionResult> GlobalSearch([FromQuery] int workspaceId,
                                               [FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { message = "كلمة البحث مطلوبة" });

            var userId = GetUserId();

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);

            if (!isMember) return Forbid();

            // جيب كل الاجتماعات من الداتا بيز وحولها لـ documents للـ AI
            var meetings = await _db.Meetings
                .Include(m => m.Participants)
                .Where(m => m.WorkspaceId == workspaceId
                         && m.Status == Models.Enums.MeetingStatus.Completed)
                .ToListAsync();

            // لو مفيش اجتماعات
            if (!meetings.Any())
                return Ok(new { meetings = new List<object>(), tasks = new List<object>() });

            // حول الاجتماعات لـ SearchDocuments عشان تبعتها للـ AI
            var documents = meetings.Select(m => new SearchDocument
            {
                Id = m.Id.ToString(),
                Title = m.Title ?? "",
                Text = $"{m.Summary ?? ""} {m.OriginalText ?? ""}",
                Date = m.CreatedAt.ToString("yyyy-MM-dd"),
                Speakers = m.Participants.Select(p => p.Name).ToList()
            }).ToList();

            // 
            var aiResponse = await _ai.SemanticSearchAsync(q, documents);

            // جيب التاسكات بالبحث العادي
            var tasks = await _db.MeetingTasks
                .Where(t => t.WorkspaceId == workspaceId
                         && (t.Title.Contains(q) || (t.Description != null
                         && t.Description.Contains(q))))
                .Select(t => new
                {
                    id = t.Id,
                    type = "Task",
                    title = t.Title,
                    description = t.Description,
                    status = t.Status.ToString(),
                    priority = t.Priority.ToString(),
                    date = t.CreatedAt
                })
                .ToListAsync();

            double minThreshold = 0.82;

            // شكّل النتايج النهائية مع تطبيق الفلتر
            var meetingResults = aiResponse.Results
                .Where(r => r.Score >= minThreshold) 
                .Select(r => new
                {
                    id = r.DocumentId,
                    type = "Meeting",
                    title = r.MeetingTitle,
                    snippet = r.Snippet,
                    score = r.Score,
                    speakers = r.Speakers,
                    date = r.MeetingDate
                }).ToList();

            return Ok(new
            {
                meetings = meetingResults,
                tasks
            });
        }
    }
    }
