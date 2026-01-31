// Login page toggle functionality
const logincontainer = document.querySelector('.logincontainer');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    logincontainer.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    logincontainer.classList.remove('active');
});

// Login form validation and submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            e.preventDefault();
            showAlert('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        showLoadingState(this);
    });
}

// Register form validation and submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validate username
        if (username.length < 3) {
            e.preventDefault();
            showAlert('Username must be at least 3 characters', 'error');
            return;
        }

        // Validate email
        if (!isValidEmail(email)) {
            e.preventDefault();
            showAlert('Please enter a valid email address', 'error');
            return;
        }

        // Validate password
        if (password.length < 6) {
            e.preventDefault();
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        // Validate password strength
        if (!isStrongPassword(password)) {
            e.preventDefault();
            showAlert('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', 'error');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            e.preventDefault();
            showAlert('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        showLoadingState(this);
    });

    // Real-time password validation
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            validatePasswordStrength(this.value);
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            validatePasswordMatch();
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Strong password validation
function isStrongPassword(password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return strongPasswordRegex.test(password);
}

// Password strength indicator
function validatePasswordStrength(password) {
    const hint = document.querySelector('.password-hint');
    if (!hint) return;

    if (password.length === 0) {
        hint.style.color = '#666';
        hint.textContent = 'Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
        return;
    }

    if (password.length < 6) {
        hint.style.color = '#dc3545';
        hint.textContent = 'Too short (min 6 characters)';
    } else if (!isStrongPassword(password)) {
        hint.style.color = '#ffc107';
        hint.textContent = 'Weak: Add uppercase, number, and special character';
    } else {
        hint.style.color = '#28a745';
        hint.textContent = 'Strong password!';
    }
}

// Password match validation
function validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const confirmInput = document.getElementById('registerConfirmPassword');

    if (confirmPassword.length === 0) {
        confirmInput.style.borderColor = '';
        return;
    }

    if (password === confirmPassword) {
        confirmInput.style.borderColor = '#28a745';
    } else {
        confirmInput.style.borderColor = '#dc3545';
    }
}

// Show loading state on form submission
function showLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    if (btnText && btnSpinner) {
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;
    }
}

// Show alert messages
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    alert.innerHTML = `
        <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Insert alert at the top of the active form
    const activeForm = document.querySelector('.logincontainer.active .form-box.register form') ||
        document.querySelector('.form-box.login form');
    if (activeForm) {
        activeForm.insertBefore(alert, activeForm.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function () {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });

    // Check if there's a registration success message
    const successMessage = document.querySelector('.alert-success');
    if (successMessage) {
        // Keep login form visible
        logincontainer.classList.remove('active');
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}