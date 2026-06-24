using Aftermeeting.Models.Enums;

namespace Aftermeeting.DTOs
{
    public class CreateMeetingRequest
    {
        public int WorkspaceId { get; set; }
        public MeetingInputType InputType { get; set; }
        public string? Text { get; set; } 
    }

    public class MeetingListResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string InputType { get; set; } = string.Empty;
        public int ParticipantsCount { get; set; }
        public int TasksCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MeetingDetailsResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? OriginalText { get; set; }
        public string Status { get; set; } = string.Empty;
        public string InputType { get; set; } = string.Empty;
        public List<ParticipantResponse> Participants { get; set; } = new();
        public List<TaskResponse> Tasks { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class ParticipantResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool IsExternal { get; set; }
    }

    public class TaskResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string? AssignedTo { get; set; }
    }
}