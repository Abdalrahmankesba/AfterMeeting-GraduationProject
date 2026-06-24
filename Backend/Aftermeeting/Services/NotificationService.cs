using Aftermeeting.Data;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;

namespace Aftermeeting.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _db;

        public NotificationService(AppDbContext db)
        {
            _db = db;
        }

        public async Task SendAsync(int userId, string title, string message,
                                    NotificationType type, string? targetUrl = null)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                TargetUrl = targetUrl
            });

            await _db.SaveChangesAsync();
        }
    }
}