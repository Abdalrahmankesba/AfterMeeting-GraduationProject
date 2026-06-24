using Aftermeeting.Data;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;

namespace Aftermeeting.Services
{
    public class MeetingProcessingService
    {
        private readonly AppDbContext _db;
        private readonly AiService _ai;
        private readonly NotificationService _notification;

        public MeetingProcessingService(AppDbContext db, AiService ai, NotificationService notification)
        {
            _db = db;
            _ai = ai;
            _notification = notification;
        }

        public async Task ProcessMeetingAsync(int meetingId, string textOrPath, bool isAudio = false)
        {
            try
            {
                string transcript;
                if (isAudio)
                    transcript = await _ai.TranscribeAudioAsync(textOrPath);
                else
                    transcript = await _ai.UploadTextAsync(textOrPath);

                var result = await _ai.ProcessAsync(transcript);

                var meeting = await _db.Meetings.FindAsync(meetingId);
                if (meeting == null) return;

                meeting.Title = result.Title;
                meeting.Summary = result.Summary;
                meeting.OriginalText = transcript;
                meeting.Status = MeetingStatus.Completed;
                // التعديل الجديد: استخراج المهام وإضافتها
                var extractedTasks = ExtractTasksFromSummary(result.Summary);
                foreach (var taskTitle in extractedTasks)
                {
                    _db.MeetingTasks.Add(new MeetingTask
                    {
                        MeetingId = meetingId,
                        WorkspaceId = meeting.WorkspaceId,
                        Title = taskTitle,
                        Status = MeetingTaskStatus.Todo,
                        Priority = TaskPriority.Medium
                    });
                }
                foreach (var name in result.Participants)
                {
                    _db.MeetingParticipants.Add(new MeetingParticipant
                    {
                        MeetingId = meetingId,
                        Name = name,
                        IsExternal = true
                    });
                }

                await _db.SaveChangesAsync();
                await _notification.SendAsync(
                    meeting.CreatedByUserId,
                    "المعالجة انتهت ",
                    $"تم معالجة {meeting.Title} بنجاح",
                    NotificationType.MeetingProcessed,
                    $"/meetings/{meeting.Id}"
                );
            }
            catch (Exception)
            {
                var meeting = await _db.Meetings.FindAsync(meetingId);
                if (meeting != null)
                {
                    meeting.Status = MeetingStatus.Failed;
                    await _db.SaveChangesAsync();
                }
            }
        }

        // الميثود الجديدة لاستخراج المهام من الملخص
        private List<string> ExtractTasksFromSummary(string summary)
        {
            var tasks = new List<string>();
            if (string.IsNullOrEmpty(summary)) return tasks;

            var lines = summary.Split('\n');
            bool inTasksSection = false;

            foreach (var line in lines)
            {
                var trimmed = line.Trim();

                if (trimmed.Contains("المهام") || trimmed.Contains("مهام") || trimmed.ToLower().Contains("tasks"))
                {
                    inTasksSection = true;
                    continue;
                }

                if (inTasksSection && trimmed.Contains(":") && !trimmed.StartsWith("-"))
                {
                    inTasksSection = false;
                }

                if (inTasksSection && trimmed.StartsWith("-") && trimmed.Length > 2)
                {
                    tasks.Add(trimmed.TrimStart('-').Trim());
                }
            }

            return tasks;
        }
    }
}