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
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public NotificationsController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        // GET /api/notifications
        // ==================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();

            var notifications = await _db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponse
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type.ToString(),
                    IsRead = n.IsRead,
                    TargetUrl = n.TargetUrl,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // ==================
        // GET /api/notifications/unread-count
        // ==================
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();

            var count = await _db.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);

            return Ok(new { count });
        }

        // ==================
        // PUT /api/notifications/{id}/read
        // ==================
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();

            var notification = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { message = "الإشعار مش موجود" });

            notification.IsRead = true;
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم" });
        }

        // ==================
        // PUT /api/notifications/read-all
        // ==================
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();

            await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(n => n.SetProperty(x => x.IsRead, true));

            return Ok(new { message = "تم قراءة كل الإشعارات" });
        }

        // ==================
        // DELETE /api/notifications/{id}
        // ==================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();

            var notification = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound(new { message = "الإشعار مش موجود" });

            _db.Notifications.Remove(notification);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم الحذف" });
        }
    }
}