using Aftermeeting.Models.Enums;

namespace Aftermeeting.DTOs
{
    public class UpdateTaskRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public MeetingTaskStatus? Status { get; set; }
        public TaskPriority? Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedToUserId { get; set; }
    }

    public class AddCommentRequest
    {
        public string Content { get; set; } = string.Empty;
    }

    public class CommentResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}