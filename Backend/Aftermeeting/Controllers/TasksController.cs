using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TasksController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        // GET /api/tasks?workspaceId=1
        // ==================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int workspaceId,
                                                [FromQuery] MeetingTaskStatus? status,
                                                [FromQuery] TaskPriority? priority,
                                                [FromQuery] int? assignedToMe)
        {
            var userId = GetUserId();

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);

            if (!isMember)
                return Forbid();

            var query = _db.MeetingTasks
                .Where(t => t.WorkspaceId == workspaceId)
                .Include(t => t.AssignedTo)
                .Include(t => t.Meeting)
                .AsQueryable();

            // فلاتر
            if (status.HasValue)
                query = query.Where(t => t.Status == status.Value);

            if (priority.HasValue)
                query = query.Where(t => t.Priority == priority.Value);

            if (assignedToMe == 1)
                query = query.Where(t => t.AssignedToUserId == userId);

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    DueDate = t.DueDate,
                    AssignedTo = t.AssignedTo != null
                        ? $"{t.AssignedTo.FirstName} {t.AssignedTo.LastName}"
                        : null
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // ==================
        // GET /api/tasks/{id}
        // ==================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var task = await _db.MeetingTasks
                .Include(t => t.AssignedTo)
                .Include(t => t.Meeting)
                .Include(t => t.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound(new { message = "التاسك مش موجود" });

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == task.WorkspaceId && wu.UserId == userId);

            if (!isMember)
                return Forbid();

            return Ok(new
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                DueDate = task.DueDate,
                MeetingTitle = task.Meeting.Title,
                AssignedTo = task.AssignedTo != null
                    ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}"
                    : null,
                Comments = task.Comments.Select(c => new CommentResponse
                {
                    Id = c.Id,
                    Content = c.Content,
                    UserName = $"{c.User.FirstName} {c.User.LastName}",
                    CreatedAt = c.CreatedAt
                }).ToList(),
                CreatedAt = task.CreatedAt
            });
        }

        // ==================
        // PUT /api/tasks/{id}
        // ==================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTaskRequest request)
        {
            var userId = GetUserId();

            var task = await _db.MeetingTasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "التاسك مش موجود" });

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == task.WorkspaceId && wu.UserId == userId);

            if (!isMember)
                return Forbid();

            // بنحدث بس اللي اتبعت
            if (request.Title != null) task.Title = request.Title;
            if (request.Description != null) task.Description = request.Description;
            if (request.Status.HasValue) task.Status = request.Status.Value;
            if (request.Priority.HasValue) task.Priority = request.Priority.Value;
            if (request.DueDate.HasValue) task.DueDate = request.DueDate.Value;
            if (request.AssignedToUserId.HasValue)
                task.AssignedToUserId = request.AssignedToUserId.Value;

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم التعديل" });
        }

        // ==================
        // DELETE /api/tasks/{id}
        // ==================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();

            var task = await _db.MeetingTasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "التاسك مش موجود" });

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == task.WorkspaceId && wu.UserId == userId);

            if (!isMember)
                return Forbid();

            _db.MeetingTasks.Remove(task);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم الحذف" });
        }

        // ==================
        // POST /api/tasks/{id}/comments
        // ==================
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, AddCommentRequest request)
        {
            var userId = GetUserId();

            var task = await _db.MeetingTasks.FindAsync(id);

            if (task == null)
                return NotFound(new { message = "التاسك مش موجود" });

            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == task.WorkspaceId && wu.UserId == userId);

            if (!isMember)
                return Forbid();

            _db.TaskComments.Add(new TaskComment
            {
                TaskId = id,
                UserId = userId,
                Content = request.Content
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم إضافة التعليق" });
        }

        // ==================
        // الإضافة الجديدة: GET /api/tasks/workspace-stats
        // ==================
        [HttpGet("workspace-stats")]
        public async Task<IActionResult> GetWorkspaceTaskStats([FromQuery] int workspaceId)
        {
            var userId = GetUserId();

            // التأكد من العضوية للورك سبيس
            var isMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == workspaceId && wu.UserId == userId);

            if (!isMember) return Forbid();

            // جلب كل التاسكات المربوطة بالورك سبيس ده
            var allTasks = await _db.MeetingTasks
                .Where(t => t.WorkspaceId == workspaceId)
                .ToListAsync();

            // إرسال الإحصائيات (الإجمالي وتصنيفهم حسب الحالة)
            return Ok(new
            {
                total = allTasks.Count,
                todo = allTasks.Count(t => (int)t.Status == 0),
                inProgress = allTasks.Count(t => (int)t.Status == 1),
                done = allTasks.Count(t => (int)t.Status == 2)
            });
        }
    }
}