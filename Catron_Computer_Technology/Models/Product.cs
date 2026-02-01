using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Catron_Computer_Technology.Models
{
    [Table("Products")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductId { get; set; }

        [Required]
        [StringLength(200)]
        [Column(TypeName = "nvarchar(200)")]
        public string Title { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [StringLength(500)]
        [Column(TypeName = "nvarchar(500)")]
        public string ImageUrl { get; set; }

        [Required]
        [StringLength(50)]
        [Column(TypeName = "nvarchar(50)")]
        public string ProductType { get; set; }

        [Column(TypeName = "int")]
        public int Stocks { get; set; }

        [StringLength(100)]
        [Column(TypeName = "nvarchar(100)")]
        public string Options { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column(TypeName = "bit")]
        public bool IsActive { get; set; } = true;

        // Navigation property
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}