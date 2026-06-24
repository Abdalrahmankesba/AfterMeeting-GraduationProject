using Aftermeeting.Models.Enums;

namespace Aftermeeting.Models
{
    public class MeetingParticipant
    {
        public int Id { get; set; }
        public int MeetingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool IsExternal { get; set; } = false;

        // Navigation
        public Meeting Meeting { get; set; } = null!;
    }
}