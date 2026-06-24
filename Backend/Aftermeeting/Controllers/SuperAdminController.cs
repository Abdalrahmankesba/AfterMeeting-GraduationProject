using Aftermeeting.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")] // القفل المركزي: للمطور فقط
    public class SuperAdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SuperAdminController(AppDbContext db)
        {
            _db = db;
        }

        #region 📊 Dashboard Stats
        // 1. إحصائيات النظام الشاملة (الموقع كله في أرقام)
        [HttpGet("stats")]
        public async Task<IActionResult> GetGlobalStats()
        {
            var stats = new
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalWorkspaces = await _db.Workspaces.CountAsync(),
                TotalMeetings = await _db.Meetings.CountAsync(),
                TotalTasks = await _db.MeetingTasks.CountAsync()
            };

            return Ok(stats);
        }
        #endregion

        #region 👥 Users Management
        // 2. عرض كل المستخدمين
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _db.Users
                .Select(u => new
                {
                    u.Id,
                    FullName = $"{u.FirstName} {u.LastName}",
                    u.Email,
                    u.IsAdmin,
                    u.IsSuspended, // تأكد من إضافة هذا الحقل في الـ Model
                    u.CreatedAt,
                    WorkspacesCount = _db.Workspaces.Count(w => w.CreatedByUserId == u.Id)
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        // 3. منح/سحب صلاحية الأدمن
        [HttpPut("users/{id}/toggle-admin")]
        public async Task<IActionResult> ToggleAdmin(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            if (user.Id == currentUserId) return BadRequest(new { message = "لا يمكنك سحب الصلاحية من نفسك" });

            user.IsAdmin = !user.IsAdmin;
            await _db.SaveChangesAsync();

            return Ok(new { message = $"تم تغيير حالة الأدمن لـ {user.FirstName}" });
        }

        // 4. إيقاف / تفعيل حساب مستخدم (Toggle Suspend)
        [HttpPut("users/{id}/toggle-suspend")]
        public async Task<IActionResult> ToggleSuspend(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            if (user.Id == currentUserId) return BadRequest(new { message = "لا يمكنك إيقاف حسابك الشخصي" });

            user.IsSuspended = !user.IsSuspended;
            await _db.SaveChangesAsync();

            return Ok(new { message = $"تم تعديل حالة الحساب للمستخدم {user.FirstName}" });
        }

        // 5. الحذف النهائي للمستخدم (Hard Delete)
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم حذف المستخدم وكل بياناته نهائياً" });
        }
        #endregion

        #region 🏢 Workspaces Management
        // 6. عرض كل مساحات العمل
        [HttpGet("workspaces")]
        public async Task<IActionResult> GetAllWorkspaces()
        {
            var workspaces = await _db.Workspaces
                .Select(w => new
                {
                    w.Id,
                    w.Name,
                    Type = w.Type.ToString(),
                    OwnerEmail = w.CreatedBy.Email,
                    MembersCount = _db.WorkspaceUsers.Count(wu => wu.WorkspaceId == w.Id),
                    MeetingsCount = _db.Meetings.Count(m => m.WorkspaceId == w.Id)
                })
                .ToListAsync();

            return Ok(workspaces);
        }

        // 7. حذف مساحة عمل بالكامل (Force Delete)
        [HttpDelete("workspaces/{id}")]
        public async Task<IActionResult> DeleteWorkspace(int id)
        {
            var workspace = await _db.Workspaces.FindAsync(id);
            if (workspace == null) return NotFound(new { message = "مساحة العمل غير موجودة" });

            _db.Workspaces.Remove(workspace);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم حذف مساحة العمل وكل بياناتها بنجاح" });
        }
        #endregion

        #region 🎙️ Meetings Management
        // 8. جلب كافة اجتماعات النظام
        [HttpGet("meetings")]
        public async Task<IActionResult> GetAllMeetings()
        {
            var meetings = await _db.Meetings
                .Select(m => new Aftermeeting.DTOs.MeetingListResponse
                {
                    Id = m.Id,
                    Title = m.Title,
                    Status = m.Status.ToString(),
                    InputType = m.InputType.ToString(),
                    TasksCount = _db.MeetingTasks.Count(t => t.MeetingId == m.Id),
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(meetings);
        }

        // 9. حذف اجتماع معين
        [HttpDelete("meetings/{id}")]
        public async Task<IActionResult> DeleteMeeting(int id)
        {
            var meeting = await _db.Meetings.FindAsync(id);
            if (meeting == null) return NotFound(new { message = "الاجتماع غير موجود" });

            _db.Meetings.Remove(meeting);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم حذف الاجتماع نهائياً من النظام" });
        }
        #endregion

        #region ✅ Tasks Management
        // 10. جلب مراقبة المهام الشاملة
        [HttpGet("tasks")]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _db.MeetingTasks
                .Select(t => new Aftermeeting.DTOs.TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status.ToString(),
                    Priority = t.Priority.ToString(),
                    DueDate = t.DueDate,
                })
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            return Ok(tasks);
        }

        // 11. حذف مهمة
        [HttpDelete("tasks/{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _db.MeetingTasks.FindAsync(id);
            if (task == null) return NotFound(new { message = "المهمة غير موجودة" });

            _db.MeetingTasks.Remove(task);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم حذف المهمة بنجاح" });
        }
        #endregion
    }
}