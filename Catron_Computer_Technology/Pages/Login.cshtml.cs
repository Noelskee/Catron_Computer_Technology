using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Catron_Computer_Technology.Data;
using Catron_Computer_Technology.Models;
using Catron_Computer_Technology.Helpers;
using System.ComponentModel.DataAnnotations;

namespace Catron_Computer_Technology.Pages
{
    public class LoginModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public LoginModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public LoginInputModel LoginInput { get; set; }

        [BindProperty]
        public RegisterInputModel RegisterInput { get; set; }

        [TempData]
        public string SuccessMessage { get; set; }

        [TempData]
        public string ErrorMessage { get; set; }

        public class LoginInputModel
        {
            [Required(ErrorMessage = "Username is required")]
            public string Username { get; set; }

            [Required(ErrorMessage = "Password is required")]
            public string Password { get; set; }
        }

        public class RegisterInputModel
        {
            [Required(ErrorMessage = "Username is required")]
            [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
            public string Username { get; set; }

            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Password is required")]
            [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
            [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$",
                ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")]
            public string Password { get; set; }

            [Required(ErrorMessage = "Please confirm your password")]
            [Compare("Password", ErrorMessage = "Passwords do not match")]
            public string ConfirmPassword { get; set; }
        }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostLoginAsync()
        {
            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please fill in all required fields";
                return Page();
            }

            // Check if username exists
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == LoginInput.Username);

            if (user == null)
            {
                ErrorMessage = "Invalid username or password";
                return Page();
            }

            // Verify password
            if (!PasswordHasher.VerifyPassword(LoginInput.Password, user.PasswordHash))
            {
                ErrorMessage = "Invalid username or password";
                return Page();
            }

            // Check if user is active
            if (!user.IsActive)
            {
                ErrorMessage = "Your account has been deactivated. Please contact support.";
                return Page();
            }

            // Update last login
            user.LastLoginAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Set session
            HttpContext.Session.SetInt32("UserId", user.UserId);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Email", user.Email);

            // Redirect to products page
            return RedirectToPage("/products");
        }

        public async Task<IActionResult> OnPostRegisterAsync()
        {
            if (!ModelState.IsValid)
            {
                ErrorMessage = "Please fix the errors and try again";
                return Page();
            }

            // Check if username already exists
            var existingUsername = await _context.Users
                .AnyAsync(u => u.Username == RegisterInput.Username);

            if (existingUsername)
            {
                ErrorMessage = "Username already exists. Please choose a different username.";
                return Page();
            }

            // Check if email already exists
            var existingEmail = await _context.Users
                .AnyAsync(u => u.Email == RegisterInput.Email);

            if (existingEmail)
            {
                ErrorMessage = "Email already registered. Please use a different email or login.";
                return Page();
            }

            // Create new user
            var user = new User
            {
                Username = RegisterInput.Username,
                Email = RegisterInput.Email,
                PasswordHash = PasswordHasher.HashPassword(RegisterInput.Password),
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            SuccessMessage = "Registration successful! Please login with your credentials.";
            return RedirectToPage("/Login");
        }
    }
}