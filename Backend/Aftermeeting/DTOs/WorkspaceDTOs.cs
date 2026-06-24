using Aftermeeting.Models.Enums;

namespace Aftermeeting.DTOs
{
    public class CreateWorkspaceRequest
    {
        public string Name { get; set; } = string.Empty;
        public WorkspaceType Type { get; set; }
    }

    public class UpdateWorkspaceRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class InviteMemberRequest
    {
        public string Email { get; set; } = string.Empty;
        public WorkspaceRole Role { get; set; } = WorkspaceRole.Member;
    }

    public class WorkspaceResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int MembersCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class WorkspaceMemberResponse
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
    }
}