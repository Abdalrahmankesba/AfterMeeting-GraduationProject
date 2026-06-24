using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class Meeting
    {
        public int Id { get; set; }
        public int WorkspaceId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? OriginalText { get; set; }
        public string? Summary { get; set; }
        public string? AudioFilePath { get; set; }
        public MeetingInputType InputType { get; set; }
        public MeetingStatus Status { get; set; } = MeetingStatus.Processing;
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Workspace Workspace { get; set; } = null!;
        public User CreatedBy { get; set; } = null!;
        public ICollection<MeetingParticipant> Participants { get; set; } = new List<MeetingParticipant>();
        public ICollection<MeetingTask> Tasks { get; set; } = new List<MeetingTask>();
        public MeetingEmbedding? Embedding { get; set; }
    }
}