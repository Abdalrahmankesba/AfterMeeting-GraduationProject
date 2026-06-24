 using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;
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
    public class MeetingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IServiceScopeFactory _scopeFactory;

        public MeetingsController(AppDbContext db, IServiceScopeFactory scopeFactory)
        {
            _db = db;
            _scopeFactory = scopeFactory;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        // POST /api/meetings
        // ==================
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateMeetingRequest request, IFormFile? uploadedFile)
        {
            var userId = GetUserId();

            if (request.InputType == MeetingInputType.Text && string.IsNullOrEmpty(request.Text))
                return BadRequest(new { message = "اكتب النص!" });
            // التحقق من الملف
            bool isFileExpected = request.InputType == MeetingInputType.Audio
                                || request.InputType == MeetingInputType.Recording;
            if (isFileExpected && uploadedFile == null)
                return BadRequest(new { message = "برجاء رفع الملف المطلوب!" });
            // التأكد من العضوية
            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == request.WorkspaceId && wu.UserId == userId);

            if (!isMember) return Forbid();
            // حفظ الملف
            string? savedFilePath = null;
            if (uploadedFile != null)
            {
                string folderName = request.InputType == MeetingInputType.Audio ? "Audio" : "Recordings";
                var uploadsFolder = Path.Combine("Uploads", folderName);
                Directory.CreateDirectory(uploadsFolder);

                savedFilePath = Path.Combine(uploadsFolder,
                    $"{Guid.NewGuid()}{Path.GetExtension(uploadedFile.FileName)}");

                using var stream = new FileStream(savedFilePath, FileMode.Create);
                await uploadedFile.CopyToAsync(stream);
            }

            // إنشاء سجل الاجتماع
            var meeting = new Meeting
            {
                WorkspaceId = request.WorkspaceId,
                Title = "جاري المعالجة...",
                OriginalText = request.Text,
                AudioFilePath = savedFilePath,
                InputType = request.InputType,
                Status = MeetingStatus.Processing,
                CreatedByUserId = userId
            };
            _db.Meetings.Add(meeting);
            await _db.SaveChangesAsync();

            _ = Task.Run(async () =>

            {
                using var scope = _scopeFactory.CreateScope();
                var processingService = scope.ServiceProvider
                    .GetRequiredService<MeetingProcessingService>();

                bool isAudioInput = request.InputType == MeetingInputType.Audio
                                 || request.InputType == MeetingInputType.Recording;

                await processingService.ProcessMeetingAsync(
                    meeting.Id,
                    isAudioInput ? (savedFilePath ?? "") : (request.Text ?? ""),
                    isAudioInput);
            });

            return Ok(new { message = "تم بدء المعالجة بنجاح", meetingId = meeting.Id });
        }
        // ==================
        // GET /api/meetings/{id}/status
        // ==================
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetStatus(int id)
        {
            var meeting = await _db.Meetings
                .Select(m => new { m.Id, m.Status })
                .FirstOrDefaultAsync(m => m.Id == id);

            if (meeting == null)
                return NotFound(new { message = "الاجتماع غير موجود" });

            return Ok(new
            {
                meetingId = meeting.Id,
                status = meeting.Status.ToString()
            });
        }

        // ==================
        // GET /api/meetings/{id}
        // ==================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();
            var meeting = await _db.Meetings
                .Include(m => m.Participants)
                .Include(m => m.Tasks)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (meeting == null) return NotFound();

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == meeting.WorkspaceId && wu.UserId == userId);

            if (!isMember) return Forbid();

            return Ok(new MeetingDetailsResponse
            {
                Id = meeting.Id,
                Title = meeting.Title,
                Summary = meeting.Summary,
                Status = meeting.Status.ToString(),
                // تعديل المشاركين
                Participants = meeting.Participants.Select(p => new ParticipantResponse
                {
                    Id = p.Id,
                    Name = p.Name
                }).ToList(),
                // تعديل المهام
                Tasks = meeting.Tasks.Select(t => new TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Status = t.Status.ToString()
                }).ToList()
            });
        }



        // ==================
        // GET /api/meetings?workspaceId=1
        // ==================
        [HttpGet]
        public async Task<IActionResult> GetAllMeetings([FromQuery] int workspaceId)
        {
            var userId = GetUserId();

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);

            if (!isMember) return Forbid();

            var meetings = await _db.Meetings
                .Where(m => m.WorkspaceId == workspaceId)
                .Include(m => m.Participants)
                .Include(m => m.Tasks)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new MeetingListResponse
                {
                    Id = m.Id,
                    Title = m.Title,
                    Status = m.Status.ToString(),
                    InputType = m.InputType.ToString(),
                    ParticipantsCount = m.Participants.Count,
                    TasksCount = m.Tasks.Count,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(meetings);
        }

        // ==================
        // DELETE /api/meetings/{id}
        // ==================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();

            var meeting = await _db.Meetings
                .FirstOrDefaultAsync(m => m.Id == id && m.CreatedByUserId == userId);

            if (meeting == null)
                return NotFound(new { message = "الاجتماع غير موجود" });

            _db.Meetings.Remove(meeting);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم الحذف" });
        }

        // احصائيات
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] int workspaceId)
        {
            var userId = GetUserId();

            // التأكد من العضوية
            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);
            if (!isMember) return Forbid();

            var meetingStatuses = await _db.Meetings
                .Where(m => m.WorkspaceId == workspaceId)
                .Select(m => m.Status)
                .ToListAsync();

            var totalMeetings = meetingStatuses.Count;
            var completedMeetings = meetingStatuses.Count(s => (int)s == 1);
            var processingMeetings = meetingStatuses.Count(s => (int)s == 0);
            var failedMeetings = meetingStatuses.Count(s => (int)s == 2);

            double hoursSaved = totalMeetings * 0.5;

            // 4. آخر الاجتماعات (Recent Stream)
            var recentMeetings = await _db.Meetings
                .Where(m => m.WorkspaceId == workspaceId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(5)
                .Select(m => new {
                    m.Id,
                    m.Title,
                    m.Status,
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalAssets = totalMeetings,
                hoursSaved = hoursSaved,
                recentMeetings = recentMeetings,

                meetings = new
                {
                    completed = completedMeetings,
                    processing = processingMeetings,
                    failed = failedMeetings
                }
            });
        }


    }
}