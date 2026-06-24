using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; } // المستخدم اللي هيستلم الإشعار
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; } = false; // عشان نعرف الإشعار اتشاف ولا لأ
        public string? TargetUrl { get; set; } // لينك يودي المستخدم للمهمة أو الاجتماع مباشرة
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User User { get; set; } = null!;
    }
}