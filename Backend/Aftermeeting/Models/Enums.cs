namespace Aftermeeting.Models.Enums
{

    public enum WorkspaceType
    {
        Personal,
        Company
    }

    public enum WorkspaceRole
    {
        Owner,
        Member
    }

    public enum MeetingStatus
    {
        Processing,
        Completed,
        Failed
    }

    public enum MeetingInputType
    {
        Audio,
        Text,
        Recording,
        PDF     
    }

    public enum MeetingTaskStatus
    {
        Todo,
        InProgress,
        Done
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High
    }

    public enum NotificationType
    {
        TaskAssigned,
        MeetingProcessed,
        CommentAdded,
        WorkspaceInvite,
        SystemAlert
    }
}