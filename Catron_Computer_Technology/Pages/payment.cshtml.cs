using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Catron_Computer_Technology.Data;
using Catron_Computer_Technology.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Catron_Computer_Technology.Pages
{
    public class paymentModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public paymentModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public OrderInputModel OrderInput { get; set; }

        public class OrderInputModel
        {
            [Required(ErrorMessage = "Full name is required")]
            public string FullName { get; set; }

            [Required(ErrorMessage = "Address is required")]
            public string Address { get; set; }

            public string Landmark { get; set; }

            [Required(ErrorMessage = "Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address")]
            public string Email { get; set; }

            [Required(ErrorMessage = "Contact number is required")]
            [Phone(ErrorMessage = "Invalid phone number")]
            public string ContactNumber { get; set; }

            [Required(ErrorMessage = "Payment method is required")]
            public string PaymentMethod { get; set; }

            public string CartData { get; set; }

            // For Credit/Debit Card
            public string CardNumber { get; set; }
            public string ExpiryDate { get; set; }
            public string CVV { get; set; }

            // For GCash
            public string GCashNumber { get; set; }
        }

        public IActionResult OnGet()
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToPage("/Login");
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            // Check if user is logged in
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToPage("/Login");
            }

            if (!ModelState.IsValid)
            {
                TempData["ErrorMessage"] = "Please fill in all required fields";
                return Page();
            }

            // Validate payment method specific fields
            if (OrderInput.PaymentMethod == "Credit Card" || OrderInput.PaymentMethod == "Debit Card")
            {
                if (string.IsNullOrWhiteSpace(OrderInput.CardNumber) ||
                    string.IsNullOrWhiteSpace(OrderInput.ExpiryDate) ||
                    string.IsNullOrWhiteSpace(OrderInput.CVV))
                {
                    TempData["ErrorMessage"] = "Please fill in all card details";
                    return Page();
                }

                // Validate card number (basic validation - 16 digits)
                if (OrderInput.CardNumber.Replace(" ", "").Length != 16)
                {
                    TempData["ErrorMessage"] = "Invalid card number. Must be 16 digits.";
                    return Page();
                }

                // Validate CVV (3 digits)
                if (OrderInput.CVV.Length != 3)
                {
                    TempData["ErrorMessage"] = "Invalid CVV. Must be 3 digits.";
                    return Page();
                }
            }
            else if (OrderInput.PaymentMethod == "G Cash")
            {
                if (string.IsNullOrWhiteSpace(OrderInput.GCashNumber))
                {
                    TempData["ErrorMessage"] = "Please enter your GCash number";
                    return Page();
                }

                // Validate GCash number (11 digits for Philippines)
                if (OrderInput.GCashNumber.Replace(" ", "").Length != 11)
                {
                    TempData["ErrorMessage"] = "Invalid GCash number. Must be 11 digits.";
                    return Page();
                }
            }

            try
            {
                // Parse cart data from hidden field or retrieve from session
                // For now, we'll assume cart data is in the request
                // In production, you'd get this from localStorage via JavaScript

                // Generate order number
                string orderNumber = "ORD" + DateTime.Now.Ticks.ToString().Substring(8);

                // Create order
                var order = new Order
                {
                    OrderNumber = orderNumber,
                    UserId = userId.Value,
                    FullName = OrderInput.FullName,
                    Address = OrderInput.Address,
                    Landmark = OrderInput.Landmark,
                    Email = OrderInput.Email,
                    ContactNumber = OrderInput.ContactNumber,
                    PaymentMethod = OrderInput.PaymentMethod,
                    ShippingFee = 150,
                    OrderStatus = "Pending",
                    OrderDate = DateTime.Now
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Store order ID in session for confirmation page
                HttpContext.Session.SetInt32("LastOrderId", order.OrderId);
                HttpContext.Session.SetString("LastOrderNumber", order.OrderNumber);

                return RedirectToPage("/OrderConfirmation");
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = "An error occurred while processing your order. Please try again.";
                return Page();
            }
        }
    }
}