using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // كل الـ endpoints محتاجة Token
    public class WorkspacesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public WorkspacesController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        // GET /api/workspaces
        // ==================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();

            var workspaces = await _db.WorkspaceUsers
                .Where(wu => wu.UserId == userId)
                .Include(wu => wu.Workspace)
                    .ThenInclude(w => w.WorkspaceUsers)
                .Select(wu => new WorkspaceResponse
                {
                    Id = wu.Workspace.Id,
                    Name = wu.Workspace.Name,
                    Type = wu.Workspace.Type.ToString(),
                    Role = wu.Role.ToString(),
                    MembersCount = wu.Workspace.WorkspaceUsers.Count,
                    CreatedAt = wu.Workspace.CreatedAt
                })
                .ToListAsync();

            return Ok(workspaces);
        }

        // ==================
        // GET /api/workspaces/{id}
        // ==================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var workspaceUser = await _db.WorkspaceUsers
                .Include(wu => wu.Workspace)
                    .ThenInclude(w => w.WorkspaceUsers)
                        .ThenInclude(wu => wu.User)
                .FirstOrDefaultAsync(wu => wu.WorkspaceId == id && wu.UserId == userId);

            if (workspaceUser == null)
                return NotFound(new { message = "الـ Workspace مش موجود" });

            var members = workspaceUser.Workspace.WorkspaceUsers
                .Select(wu => new WorkspaceMemberResponse
                {
                    UserId = wu.UserId,
                    Name = $"{wu.User.FirstName} {wu.User.LastName}",
                    Email = wu.User.Email,
                    Role = wu.Role.ToString(),
                    JoinedAt = wu.JoinedAt
                }).ToList();

            return Ok(new
            {
                Id = workspaceUser.Workspace.Id,
                Name = workspaceUser.Workspace.Name,
                Type = workspaceUser.Workspace.Type.ToString(),
                Role = workspaceUser.Role.ToString(),
                Members = members,
                CreatedAt = workspaceUser.Workspace.CreatedAt
            });
        }

        // ==================
        // POST /api/workspaces
        // ==================
        [HttpPost]
        public async Task<IActionResult> Create(CreateWorkspaceRequest request)
        {
            var userId = GetUserId();

            var workspace = new Workspace
            {
                Name = request.Name,
                Type = request.Type,
                CreatedByUserId = userId
            };

            _db.Workspaces.Add(workspace);
            await _db.SaveChangesAsync();

            _db.WorkspaceUsers.Add(new WorkspaceUser
            {
                WorkspaceId = workspace.Id,
                UserId = userId,
                Role = WorkspaceRole.Owner
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم إنشاء الـ Workspace", workspaceId = workspace.Id });
        }

        // ==================
        // PUT /api/workspaces/{id}
        // ==================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateWorkspaceRequest request)
        {
            var userId = GetUserId();

            var workspaceUser = await _db.WorkspaceUsers
                .FirstOrDefaultAsync(wu => wu.WorkspaceId == id
                                        && wu.UserId == userId
                                        && wu.Role == WorkspaceRole.Owner);

            if (workspaceUser == null)
                return Forbid();

            var workspace = await _db.Workspaces.FindAsync(id);
            if (workspace == null) return NotFound();
            if (workspace.Type == WorkspaceType.Personal)
            {
                return BadRequest(new { message = "لا يمكن تعديل اسم المساحة الشخصية، التعديل متاح للشركات فقط" });
            }
            workspace.Name = request.Name;

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم التعديل" });
        }


        // ==================
        // DELETE /api/workspaces/{id}
        // ==================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();

            var workspace = await _db.Workspaces
                .FirstOrDefaultAsync(w => w.Id == id
                                       && w.CreatedByUserId == userId
                                       && w.Type != WorkspaceType.Personal);

            if (workspace == null)
                return NotFound(new { message = "مش موجود أو مش ليك أو Personal مينفعش تحذفه" });

            _db.Workspaces.Remove(workspace);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم الحذف" });
        }

        // ==================
        // POST /api/workspaces/{id}/invite
        // ==================
        [HttpPost("{id}/invite")]
        public async Task<IActionResult> Invite(int id, InviteMemberRequest request)
        {
            var userId = GetUserId();

            // تأكد إن اللي بيدعو هو Owner
            var isOwner = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == id
                             && wu.UserId == userId
                             && wu.Role == WorkspaceRole.Owner);

            if (!isOwner)
                return Forbid();

            // جيب اليوزر المدعو
            var invitedUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (invitedUser == null)
                return NotFound(new { message = "المستخدم ده مش موجود" });

            // تأكد إنه مش عضو بالفعل
            var alreadyMember = await _db.WorkspaceUsers
                .AnyAsync(wu => wu.WorkspaceId == id && wu.UserId == invitedUser.Id);

            if (alreadyMember)
                return BadRequest(new { message = "المستخدم ده عضو بالفعل" });

            _db.WorkspaceUsers.Add(new WorkspaceUser
            {
                WorkspaceId = id,
                UserId = invitedUser.Id,
                Role = request.Role
            });

            await _db.SaveChangesAsync();

            return Ok(new { message = "تمت الدعوة بنجاح" });
        }
    }
}