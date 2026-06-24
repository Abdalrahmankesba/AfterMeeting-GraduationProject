using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class MeetingEmbedding
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string VectorKey { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Meeting Meeting { get; set; } = null!;
    }
}