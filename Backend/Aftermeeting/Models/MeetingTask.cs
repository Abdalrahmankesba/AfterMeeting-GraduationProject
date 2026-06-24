using Aftermeeting.Models.Enums;

namespace  Aftermeeting.Models
{
    public class MeetingTask
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public int WorkspaceId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? AssignedToUserId { get; set; }
        public MeetingTaskStatus Status { get; set; } = MeetingTaskStatus.Todo;
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Meeting Meeting { get; set; } = null!;
        public Workspace Workspace { get; set; } = null!;
        public User? AssignedTo { get; set; }
        public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    }
}