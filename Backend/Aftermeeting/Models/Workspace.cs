using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class Workspace
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public WorkspaceType Type { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User CreatedBy { get; set; } = null!;
        public ICollection<WorkspaceUser> WorkspaceUsers { get; set; } = new List<WorkspaceUser>();
        public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
    }
}