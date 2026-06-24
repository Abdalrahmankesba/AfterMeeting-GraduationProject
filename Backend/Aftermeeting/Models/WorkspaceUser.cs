using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class WorkspaceUser
    {
        public int Id { get; set; }
        public int WorkspaceId { get; set; }
        public int UserId { get; set; }
        public WorkspaceRole Role { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Workspace Workspace { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}