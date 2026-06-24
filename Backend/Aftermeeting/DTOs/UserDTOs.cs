using System.ComponentModel.DataAnnotations;

namespace Aftermeeting.DTOs
{
    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "برجاء إدخال بريد إلكتروني بصيغة صحيحة")]
        public string? Email { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
ErrorMessage = "الباسورد لازم يكون 8 حروف على الأقل، ويحتوي على حرف كبير، حرف صغير، رقم، ورمز مثل @ أو $")]
        public string CurrentPassword { get; set; } = string.Empty;
        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
ErrorMessage = "الباسورد لازم يكون 8 حروف على الأقل، ويحتوي على حرف كبير، حرف صغير، رقم، ورمز مثل @ أو $")]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ProfileResponse
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}