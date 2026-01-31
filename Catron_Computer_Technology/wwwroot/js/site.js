// site.js - Main site-wide functions for Razor Pages

// Global database loading function
async function loadDB() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/MoogsKotobuki/E-COMMERCE/refs/heads/main/json/product.Json");
        const db = await response.json();
        return db;
    } catch (error) {
        console.error("Error loading database:", error);
        return [];
    }
}

// Update cart count across all pages
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalCount = 0;

    cart.forEach(item => {
        totalCount += item.quantity;
    });

    const counter = document.getElementById("cartCount");
    if (counter) {
        counter.textContent = totalCount;

        // Add pulse animation
        if (totalCount > 0) {
            counter.style.animation = 'pulse 0.3s ease-in-out';
            setTimeout(() => {
                counter.style.animation = '';
            }, 300);
        }
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Scroll animations observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);

// Apply scroll animations to elements with .animate class
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animate').forEach(el => scrollObserver.observe(el));
});

// Smooth scroll for scroll indicator
document.addEventListener('DOMContentLoaded', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function () {
            const target = document.querySelector('.home-highlight');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Price range display (for products page)
document.addEventListener('DOMContentLoaded', () => {
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function () {
            priceValue.textContent = parseInt(this.value).toLocaleString();
        });
    }
});