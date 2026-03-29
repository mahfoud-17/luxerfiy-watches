// Sample watch data
const products = [
    { id: 1, name: "The Classic Chrono", price: "2000DA", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "Midnight Onyx", price: "2100DA", image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Rose Gold Elegance", price: "3450DA", image: "https://images.unsplash.com/photo-1587836374828-cb4387df3b72?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
];

const grid = document.getElementById('product-grid');
const modal = document.getElementById('order-modal');
const closeBtn = document.querySelector('.close-btn');
const orderForm = document.getElementById('order-form');
const successMessage = document.getElementById('success-message');

// Render products dynamically
function renderProducts() {
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <button onclick="openOrderForm('${product.name}')">Order</button>
        `;
        grid.appendChild(card);
    });
}

// Modal handling
function openOrderForm(productName) {
    document.getElementById('selected-product-name').textContent = `Product: ${productName}`;
    document.getElementById('product').value = productName;
    successMessage.classList.add('hidden');
    orderForm.style.display = 'block';
    modal.style.display = 'block';
}

closeBtn.onclick = () => { modal.style.display = 'none'; }
window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; }

// Handle Form Submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    const orderData = {
        product: document.getElementById('product').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            orderForm.style.display = 'none';
            successMessage.classList.remove('hidden');
            orderForm.reset();
        } else {
            alert('Something went wrong. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to connect to the server.');
    } finally {
        submitBtn.textContent = 'Confirm Order';
        submitBtn.disabled = false;
    }
});

// Initialize
renderProducts();