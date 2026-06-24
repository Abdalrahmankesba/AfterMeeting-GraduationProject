namespace Aftermeeting.DTOs
{
    public class NotificationResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string? TargetUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}