using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ==================
        // GET /api/users/me
        // ==================
        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "المستخدم مش موجود" });

            return Ok(new ProfileResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            });
        }
        // PUT /api/users/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = GetUserId();

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "المستخدم مش موجود" });

            // تأكد إن الإيميل الجديد مش موجود عند حد تاني
            if (request.Email != null && request.Email != user.Email)
            {
                var emailExists = await _db.Users
                    .AnyAsync(u => u.Email == request.Email && u.Id != userId);

                if (emailExists)
                    return BadRequest(new { message = "الإيميل ده موجود بالفعل" });

                user.Email = request.Email;
            }

            if (request.FirstName != null) user.FirstName = request.FirstName;
            if (request.LastName != null) user.LastName = request.LastName;

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم التعديل" });
        }

        // ==================
        // PUT /api/users/me/change-password
        // ==================
        [HttpPut("me/change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userId = GetUserId();

            var user = await _db.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "المستخدم مش موجود" });

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "الباسورد الحالي غلط" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "تم تغيير الباسورد" });
        }
    }
}