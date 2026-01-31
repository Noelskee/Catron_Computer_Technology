// payment.js - Payment and order placement for payment.cshtml

(async function () {
    // DOM Elements
    const placeOrderBtn = document.getElementById('placeOrder');
    const productOrderSection = document.querySelector('.section h3');

    // Find the products section
    let productSection = null;
    document.querySelectorAll('.section').forEach(section => {
        if (section.querySelector('h3')?.textContent.includes('Product Ordered')) {
            productSection = section;
        }
    });

    // Initialize payment page
    function initializePayment() {
        renderOrderSummary();
        attachEventListeners();
        setupPaymentMethodToggle();
        updateCartCount();
    }

    // Render order summary
    function renderOrderSummary() {
        if (!productSection) {
            console.error("Product section not found");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalDiv = productSection.querySelector('.total');

        // Remove existing product displays
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

        // Add shipping
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

    // Setup payment method toggle
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
                                <label class="form-label">Card Number</label>
                                <input type="text" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Expiry Date</label>
                                    <input type="text" class="form-control" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">CVV</label>
                                    <input type="text" class="form-control" placeholder="123" maxlength="3">
                                </div>
                            </div>
                        </div>
                    `;
                } else if (this.value === 'G Cash') {
                    creditDebitInfo.innerHTML = `
                        <div class="mt-3 p-3 bg-light rounded">
                            <div class="mb-3">
                                <label class="form-label">GCash Number</label>
                                <input type="text" class="form-control" placeholder="09XX XXX XXXX" maxlength="11">
                            </div>
                        </div>
                    `;
                } else {
                    creditDebitInfo.innerHTML = '';
                }
            });
        });
    }

    // Attach event listeners
    function attachEventListeners() {
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', placeOrder);
        }
    }

    // Validate form inputs
    function validateForm() {
        const inputs = document.querySelectorAll("#address input");
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        let isValid = true;

        // Check all address fields
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

        // Check payment method
        if (!selectedPayment) {
            alert("Please select a payment method.");
            isValid = false;
        }

        return isValid;
    }

    // Place order
    function placeOrder() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
            window.location.href = "/products";
            return;
        }

        if (!validateForm()) {
            alert("Please fill out all required fields before placing your order.");
            return;
        }

        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        const paymentMethod = selectedPayment.value;

        // Get customer details from the address section
        const addressInputs = document.querySelectorAll('#address input');
        const fullName = addressInputs[0]?.value || '';
        const address = addressInputs[1]?.value || '';
        const landmark = addressInputs[2]?.value || '';
        const email = addressInputs[3]?.value || '';
        const contact = addressInputs[4]?.value || '';

        // Create order object
        const order = {
            orderId: 'ORD' + Date.now(),
            orderDate: new Date().toISOString(),
            customer: {
                name: fullName,
                address: address,
                landmark: landmark,
                email: email,
                contact: contact
            },
            items: cart,
            paymentMethod: paymentMethod,
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: 150,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 150
        };

        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push(order);
        localStorage.setItem("orders", JSON.stringify(orders));

        // Clear cart
        localStorage.removeItem("cart");

        // Show success message
        const message = `
Order Placed Successfully!

Order ID: ${order.orderId}
Payment Method: ${paymentMethod}
Total Amount: ₱${order.total.toLocaleString()}

Thank you for your purchase, ${fullName}!
Your order will be delivered to: ${address}
        `;

        alert(message);

        // Redirect to home
        window.location.href = "/Index";
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePayment);
    } else {
        initializePayment();
    }
})();