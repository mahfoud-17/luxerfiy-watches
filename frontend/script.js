// Yalidine prices from Oran: { wilaya: { home, office } }
const deliveryPrices = {
    "Oran":                 { home: 590,  office: 450 },
    "Alger":                { home: 700,  office: 550 },
    "Sidi Bel Abbès":       { home: 700,  office: 550 },
    "Mostaganem":           { home: 700,  office: 550 },
    "Mascara":              { home: 700,  office: 550 },
    "Aïn Témouchent":       { home: 700,  office: 550 },
    "Chlef":                { home: 900,  office: 650 },
    "Oum El Bouaghi":       { home: 900,  office: 650 },
    "Batna":                { home: 900,  office: 650 },
    "Béjaïa":               { home: 900,  office: 650 },
    "Blida":                { home: 900,  office: 650 },
    "Bouira":               { home: 900,  office: 650 },
    "Tlemcen":              { home: 900,  office: 650 },
    "Tiaret":               { home: 900,  office: 650 },
    "Tizi Ouzou":           { home: 900,  office: 650 },
    "Jijel":                { home: 900,  office: 650 },
    "Sétif":                { home: 900,  office: 650 },
    "Saïda":                { home: 900,  office: 650 },
    "Skikda":               { home: 900,  office: 650 },
    "Annaba":               { home: 900,  office: 650 },
    "Guelma":               { home: 900,  office: 650 },
    "Constantine":          { home: 900,  office: 650 },
    "Médéa":                { home: 900,  office: 650 },
    "M'Sila":               { home: 900,  office: 650 },
    "Bordj Bou Arreridj":   { home: 900,  office: 650 },
    "Boumerdès":            { home: 900,  office: 650 },
    "El Tarf":              { home: 900,  office: 650 },
    "Tissemsilt":           { home: 900,  office: 650 },
    "Khenchela":            { home: 900,  office: 650 },
    "Souk Ahras":           { home: 900,  office: 650 },
    "Tipaza":               { home: 900,  office: 650 },
    "Mila":                 { home: 900,  office: 650 },
    "Aïn Defla":            { home: 900,  office: 650 },
    "Relizane":             { home: 900,  office: 650 },
    "Laghouat":             { home: 950,  office: 750 },
    "Biskra":               { home: 950,  office: 750 },
    "Béchar":               { home: 950,  office: 750 },
    "Tébessa":              { home: 950,  office: 750 },
    "Djelfa":               { home: 950,  office: 750 },
    "Ouargla":              { home: 950,  office: 750 },
    "El Oued":              { home: 950,  office: 750 },
    "Ghardaïa":             { home: 950,  office: 750 },
    "Ouled Djellal":        { home: 950,  office: 750 },
    "Béni Abbès":           { home: 950,  office: 750 },
    "Touggourt":            { home: 950,  office: 750 },
    "El M'Ghair":           { home: 950,  office: 750 },
    "El Menia":             { home: 950,  office: 750 },
    "Adrar":                { home: 1050, office: 850 },
    "El Bayadh":            { home: 1050, office: 850 },
    "Naâma":                { home: 1050, office: 850 },
    "Timimoun":             { home: 1050, office: 850 },
    "Bordj Badji Mokhtar":  { home: 1050, office: 850 },
    "Tamanrasset":          { home: 1600, office: 1400 },
    "Illizi":               { home: 1600, office: 1400 },
    "Tindouf":              { home: 1600, office: 1400 },
    "In Salah":             { home: 1600, office: 1400 },
    "In Guezzam":           { home: 1600, office: 1400 },
    "Djanet":               { home: 1600, office: 1400 }
};

let currentBasePrice = 0;
let currentDeliveryType = 'office';

const grid = document.getElementById('product-grid');
const modal = document.getElementById('order-modal');
const closeBtn = document.querySelector('.close-btn');
const orderForm = document.getElementById('order-form');
const successMessage = document.getElementById('success-message');
const wilayaSelect = document.getElementById('wilayaSelect');
const deliveryDisplay = document.getElementById('deliveryDisplay');
const totalDisplay = document.getElementById('totalDisplay');

// Render products from database
async function renderProducts() {
    try {
        const res = await fetch('https://luxerfiy-watches.onrender.com/api/products');
        const products = await res.json();

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';
            const imageUrl = product.image.startsWith('/uploads')
                ? `https://luxerfiy-watches.onrender.com${product.image}`
                : product.image;
            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${product.price} DA</p>
                <button onclick="openOrderForm('${product.name}', ${product.price})">Order</button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load products:', error);
        grid.innerHTML = '<p>Failed to load products. Make sure the server is running.</p>';
    }
}

// Open modal
function openOrderForm(productName, productPrice) {
    document.getElementById('selected-product-name').textContent = `Product: ${productName}`;
    document.getElementById('product').value = productName;
    currentBasePrice = productPrice;
    successMessage.classList.add('hidden');
    orderForm.style.display = 'block';
    modal.style.display = 'block';
    deliveryDisplay.innerText = '0';
    totalDisplay.innerText = productPrice;
    setDeliveryType('office');
    wilayaSelect.value = '';
}

// Switch delivery type
function setDeliveryType(type) {
    currentDeliveryType = type;
    document.getElementById('btn-office').classList.toggle('active', type === 'office');
    document.getElementById('btn-home').classList.toggle('active', type === 'home');
    const officeGroup = document.getElementById('office-group');
    officeGroup.style.display = type === 'office' ? 'block' : 'none';
    updatePrice();
}

// Update price based on wilaya + delivery type
function updatePrice() {
    const wilaya = wilayaSelect.value;
    if (!wilaya || !deliveryPrices[wilaya]) {
        deliveryDisplay.innerText = '0';
        totalDisplay.innerText = currentBasePrice;
        return;
    }
    const deliveryPrice = deliveryPrices[wilaya][currentDeliveryType];
    deliveryDisplay.innerText = deliveryPrice;
    totalDisplay.innerText = currentBasePrice + deliveryPrice;
}

// Close modal
closeBtn.onclick = () => { modal.style.display = 'none'; };
window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

// Wilaya change
wilayaSelect.addEventListener('change', updatePrice);

// Form submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    const orderData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        wilaya: wilayaSelect.value,
        delivery_type: currentDeliveryType === 'home' ? 'Home Delivery' : 'Office Pickup',
        delivery_office: currentDeliveryType === 'office' ? document.getElementById('office').value : 'N/A',
        address: document.getElementById('address').value.trim(),
        product: document.getElementById('product').value,
        delivery_price: parseInt(deliveryDisplay.innerText) || 0,
        total_price: parseInt(totalDisplay.innerText) || 0
    };

    try {
        const response = await fetch('https://luxerfiy-watches.onrender.com/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            orderForm.style.display = 'none';
            successMessage.classList.remove('hidden');
            orderForm.reset();
            deliveryDisplay.innerText = '0';
            totalDisplay.innerText = '0';
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

renderProducts();