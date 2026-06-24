using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? PasswordResetToken { get; set; } // الـ OTP هنا
        public DateTime? ResetTokenExpires { get; set; } // وقت الانتهاء

        public bool IsAdmin { get; set; } = false;

        public bool IsSuspended { get; set; } = false;
        public ICollection<WorkspaceUser> WorkspaceUsers { get; set; } = new List<WorkspaceUser>();
        public ICollection<Workspace> CreatedWorkspaces { get; set; } = new List<Workspace>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}