using MailKit.Net.Smtp;
using MimeKit;
/*using System.Net.Mail;*/

namespace Aftermeeting.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOtpAsync(string toEmail, string otp)
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(_config["Email:From"]));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = "Aftermeeting - كود إعادة تعيين الباسورد";

            message.Body = new TextPart("html")
            {
                Text = $"""
                <div style="font-family:Arial;text-align:center;padding:40px">
                    <h2>إعادة تعيين الباسورد</h2>
                    <p>الكود بتاعك هو:</p>
                    <h1 style="color:#6C63FF;letter-spacing:8px">{otp}</h1>
                    <p>صالح لمدة 10 دقايق بس</p>
                </div>
                """
            };
            Console.WriteLine($"🔑 OTP for {toEmail}: {otp}");

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_config["Email:Host"],
                int.Parse(_config["Email:Port"]!),
                MailKit.Security.SecureSocketOptions.Auto);
            await smtp.AuthenticateAsync(_config["Email:Username"],
                _config["Email:Password"]);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}