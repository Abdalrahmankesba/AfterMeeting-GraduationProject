namespace Aftermeeting.DTOs
{
    public class SearchResultDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public DateTime Date { get; set; }
    }
}