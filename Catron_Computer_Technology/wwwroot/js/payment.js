// payment.js - Enhanced with backend integration

(async function () {
    const placeOrderBtn = document.getElementById('placeOrder');
    let productSection = null;

    document.querySelectorAll('.section').forEach(section => {
        if (section.querySelector('h3')?.textContent.includes('Product Ordered')) {
            productSection = section;
        }
    });

    function initializePayment() {
        renderOrderSummary();
        attachEventListeners();
        setupPaymentMethodToggle();
        updateCartCount();
    }

    function renderOrderSummary() {
        if (!productSection) {
            console.error("Product section not found");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalDiv = productSection.querySelector('.total');

        productSection.querySelectorAll('.product').forEach(p => p.remove());

        if (cart.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'product text-center py-3';
            emptyDiv.innerHTML = '<div class="text-muted">No items in cart</div>';
            productSection.insertBefore(emptyDiv, totalDiv);

            if (totalDiv) {
                totalDiv.textContent = 'Total: ₱0.00';
            }
            return;
        }

        let grandTotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;

            let title = item.title;
            if (item.optionSelected) {
                title += ` - ${item.optionSelected}`;
            }

            const productDiv = document.createElement('div');
            productDiv.className = 'product d-flex justify-content-between align-items-center py-2 border-bottom';
            productDiv.innerHTML = `
                <div class="flex-grow-1">
                    <strong>${title}</strong>
                    <small class="text-muted d-block">Qty: ${item.quantity}</small>
                </div>
                <div class="text-success fw-bold">₱${itemTotal.toLocaleString()}</div>
            `;

            productSection.insertBefore(productDiv, totalDiv);
        });

        const shipping = 150;
        grandTotal += shipping;

        const shippingDiv = document.createElement('div');
        shippingDiv.className = 'product d-flex justify-content-between align-items-center py-2 border-bottom';
        shippingDiv.innerHTML = `
            <div><strong>Shipping Fee</strong></div>
            <div class="text-success fw-bold">₱${shipping.toLocaleString()}</div>
        `;
        productSection.insertBefore(shippingDiv, totalDiv);

        if (totalDiv) {
            totalDiv.className = 'total mt-3 pt-3 border-top';
            totalDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">Total:</h4>
                    <h4 class="mb-0 text-success">₱${grandTotal.toLocaleString()}</h4>
                </div>
            `;
        }
    }

    function setupPaymentMethodToggle() {
        const paymentRadios = document.querySelectorAll('input[name="payment"]');
        const creditDebitInfo = document.getElementById('creditDebitInfo');

        if (!creditDebitInfo) return;

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'Credit Card' || this.value === 'Debit Card') {
                    creditDebitInfo.innerHTML = `
                        <div class="mt-3 p-3 bg-light rounded">
                            <div class="mb-3">
                                <label class="form-label">Card Number <span class="text-danger">*</span></label>
                                <input type="text" name="OrderInput.CardNumber" class="form-control" 
                                       placeholder="1234 5678 9012 3456" maxlength="19" required 
                                       pattern="[0-9 ]{16,19}">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expiry Date <span class="text-danger">*</span></label>
                                    <input type="text" name="OrderInput.ExpiryDate" class="form-control" 
                                           placeholder="MM/YY" maxlength="5" required pattern="[0-9]{2}/[0-9]{2}">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">CVV <span class="text-danger">*</span></label>
                                    <input type="text" name="OrderInput.CVV" class="form-control" 
                                           placeholder="123" maxlength="3" required pattern="[0-9]{3}">
                                </div>
                            </div>
                        </div>
                    `;
                } else if (this.value === 'G Cash') {
                    creditDebitInfo.innerHTML = `
                        <div class="mt-3 p-3 bg-light rounded">
                            <div class="mb-3">
                                <label class="form-label">GCash Number <span class="text-danger">*</span></label>
                                <input type="text" name="OrderInput.GCashNumber" class="form-control" 
                                       placeholder="09XX XXX XXXX" maxlength="11" required pattern="[0-9]{11}">
                            </div>
                        </div>
                    `;
                } else {
                    creditDebitInfo.innerHTML = '';
                }
            });
        });
    }

    function attachEventListeners() {
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', placeOrder);
        }
    }

    function validateForm() {
        const inputs = document.querySelectorAll("#address input[required]");
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add("is-invalid");
                input.classList.add("border-danger");
                isValid = false;
            } else {
                input.classList.remove("is-invalid");
                input.classList.remove("border-danger");
                input.classList.add("border-success");
            }
        });

        if (!selectedPayment) {
            alert("Please select a payment method.");
            isValid = false;
            return false;
        }

        // Validate payment-specific fields
        const paymentMethod = selectedPayment.value;
        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            const cardNumber = document.querySelector('input[name="OrderInput.CardNumber"]');
            const expiryDate = document.querySelector('input[name="OrderInput.ExpiryDate"]');
            const cvv = document.querySelector('input[name="OrderInput.CVV"]');

            if (!cardNumber || !cardNumber.value.replace(/\s/g, '').match(/^\d{16}$/)) {
                alert("Please enter a valid 16-digit card number");
                if (cardNumber) cardNumber.focus();
                return false;
            }

            if (!expiryDate || !expiryDate.value.match(/^\d{2}\/\d{2}$/)) {
                alert("Please enter expiry date in MM/YY format");
                if (expiryDate) expiryDate.focus();
                return false;
            }

            if (!cvv || !cvv.value.match(/^\d{3}$/)) {
                alert("Please enter a valid 3-digit CVV");
                if (cvv) cvv.focus();
                return false;
            }
        } else if (paymentMethod === 'G Cash') {
            const gcashNumber = document.querySelector('input[name="OrderInput.GCashNumber"]');
            if (!gcashNumber || !gcashNumber.value.replace(/\s/g, '').match(/^\d{11}$/)) {
                alert("Please enter a valid 11-digit GCash number");
                if (gcashNumber) gcashNumber.focus();
                return false;
            }
        }

        return isValid;
    }

    async function placeOrder() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
            window.location.href = "/products";
            return;
        }

        if (!validateForm()) {
            return;
        }

        // Create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/payment';

        // Add form fields
        const addressInputs = document.querySelectorAll('#address input');
        const fullName = addressInputs[0]?.value || '';
        const address = addressInputs[1]?.value || '';
        const landmark = addressInputs[2]?.value || '';
        const email = addressInputs[3]?.value || '';
        const contact = addressInputs[4]?.value || '';

        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = selectedPayment.value;

        // Add hidden inputs
        addHiddenField(form, 'OrderInput.FullName', fullName);
        addHiddenField(form, 'OrderInput.Address', address);
        addHiddenField(form, 'OrderInput.Landmark', landmark);
        addHiddenField(form, 'OrderInput.Email', email);
        addHiddenField(form, 'OrderInput.ContactNumber', contact);
        addHiddenField(form, 'OrderInput.PaymentMethod', paymentMethod);
        addHiddenField(form, 'OrderInput.CartData', JSON.stringify(cart));

        // Add payment-specific fields
        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            const cardNumber = document.querySelector('input[name="OrderInput.CardNumber"]')?.value;
            const expiryDate = document.querySelector('input[name="OrderInput.ExpiryDate"]')?.value;
            const cvv = document.querySelector('input[name="OrderInput.CVV"]')?.value;

            addHiddenField(form, 'OrderInput.CardNumber', cardNumber);
            addHiddenField(form, 'OrderInput.ExpiryDate', expiryDate);
            addHiddenField(form, 'OrderInput.CVV', cvv);
        } else if (paymentMethod === 'G Cash') {
            const gcashNumber = document.querySelector('input[name="OrderInput.GCashNumber"]')?.value;
            addHiddenField(form, 'OrderInput.GCashNumber', gcashNumber);
        }

        // Add anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        if (token) {
            addHiddenField(form, '__RequestVerificationToken', token);
        }

        document.body.appendChild(form);
        form.submit();
    }

    function addHiddenField(form, name, value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value || '';
        form.appendChild(input);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePayment);
    } else {
        initializePayment();
    }
})();