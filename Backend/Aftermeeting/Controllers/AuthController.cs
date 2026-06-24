using Aftermeeting.Data;
using Aftermeeting.DTOs;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;
using Aftermeeting.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aftermeeting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext db, JwtService jwt , EmailService emailService)
        {
            _db = db;
            _jwt = jwt;
            _emailService = emailService;

        }

        // ==================
        // POST /api/auth/register
        // ==================
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "الإيميل ده موجود بالفعل" });

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // عمل Personal Workspace تلقائي
            var workspace = new Workspace
            {
                Name = $"{user.FirstName} {user.LastName}'s Workspace",
                Type = WorkspaceType.Personal,
                CreatedByUserId = user.Id
            };

            _db.Workspaces.Add(workspace);
            await _db.SaveChangesAsync();

            // ضيف اليوزر كـ Owner في الـ Workspace
            var workspaceUser = new WorkspaceUser
            {
                WorkspaceId = workspace.Id,
                UserId = user.Id,
                Role = WorkspaceRole.Owner
            };

            _db.WorkspaceUsers.Add(workspaceUser);
            await _db.SaveChangesAsync();

            var token = _jwt.GenerateToken(user, workspace.Id);

            return Ok(new AuthResponse
            {
                Token = token,
                Name = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                WorkspaceId = workspace.Id
                ,
                IsAdmin = user.IsAdmin
            });
        }

        // ==================
        // POST /api/auth/login
        // ==================
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "إيميل أو باسورد غلط" });

            // جيب الـ Personal Workspace بتاعه
            var workspace = await _db.Workspaces
                .FirstOrDefaultAsync(w => w.CreatedByUserId == user.Id
                                       && w.Type == WorkspaceType.Personal);

            var token = _jwt.GenerateToken(user, workspace!.Id);

            return Ok(new AuthResponse
            {
                Token = token,
                Name =  $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                WorkspaceId = workspace.Id,
                IsAdmin = user.IsAdmin
            });
        }
        // ==================
        // POST /api/auth/forgot-password
        // ==================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Ok(new { message = "لو الإيميل موجود هيوصلك كود" });

            // عمل OTP عشوائي 6 أرقام
            var otp = new Random().Next(100000, 999999).ToString();
            user.PasswordResetToken = BCrypt.Net.BCrypt.HashPassword(otp);
            user.ResetTokenExpires = DateTime.UtcNow.AddMinutes(10);

            await _db.SaveChangesAsync();

            await _emailService.SendOtpAsync(user.Email, otp);

            return Ok(new { message = "لو الإيميل موجود هيوصلك كود" });
        }

        // ==================
        // POST /api/auth/verify-otp
        // ==================
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.PasswordResetToken == null)
                return BadRequest(new { message = "كود غلط أو منتهي" });

            if (user.ResetTokenExpires < DateTime.UtcNow)
                return BadRequest(new { message = "الكود انتهت صلاحيته" });

            if (!BCrypt.Net.BCrypt.Verify(request.Otp, user.PasswordResetToken))
                return BadRequest(new { message = "كود غلط أو منتهي" });

            return Ok(new { message = "الكود صح" });
        }

        // ==================
        // POST /api/auth/reset-password
        // ==================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || user.PasswordResetToken == null)
                return BadRequest(new { message = "كود غلط أو منتهي" });

            if (user.ResetTokenExpires < DateTime.UtcNow)
                return BadRequest(new { message = "الكود انتهت صلاحيته" });

            if (!BCrypt.Net.BCrypt.Verify(request.Otp, user.PasswordResetToken))
                return BadRequest(new { message = "كود غلط أو منتهي" });

            // تحديث الباسورد وإلغاء الـ OTP
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.ResetTokenExpires = null;

            await _db.SaveChangesAsync();

            return Ok(new { message = "تم تغيير الباسورد بنجاح" });
        }
    }
}