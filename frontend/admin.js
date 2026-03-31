const API = 'https://luxerfiy-watches.onrender.com';

// ─── LOGIN ────────────────────────────────────────────────
async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('admin-page').classList.remove('hidden');
    loadWatches();
}

// Check if already logged in
if (sessionStorage.getItem('adminLoggedIn') === 'true') showDashboard();

// ─── LOAD WATCHES ─────────────────────────────────────────
async function loadWatches() {
    const res = await fetch(`${API}/api/products`);
    const watches = await res.json();
    const list = document.getElementById('watch-list');

    if (watches.length === 0) {
        list.innerHTML = '<p class="empty">No watches yet.</p>';
        return;
    }

    list.innerHTML = watches.map(w => `
        <div class="watch-card">
            <img src="${w.image.startsWith('/uploads') ? API + w.image : w.image}" alt="${w.name}">
            <div class="watch-info">
                <h3>${w.name}</h3>
                <p>${w.price} DA</p>
            </div>
            <div class="watch-actions">
                <button class="edit-btn" onclick="openEditModal(${w.id}, '${w.name}', ${w.price})">Edit</button>
                <button class="delete-btn" onclick="deleteWatch(${w.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ─── ADD WATCH ────────────────────────────────────────────

   async function addWatch() {
    const name = document.getElementById('new-name').value.trim();
    const price = document.getElementById('new-price').value.trim();
    // 1. Change .files[0] to .value to get the URL string
    const imageUrl = document.getElementById('new-image').value.trim(); 
    const errorEl = document.getElementById('add-error');

    if (!name || !price || !imageUrl) {
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');

    // 2. We use a plain object instead of FormData
    const watchData = {
        name: name,
        price: price,
        image: imageUrl
    };

    const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        // 3. Tell the server we are sending JSON
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(watchData)
    });

    if (res.ok) {
        // Clear inputs
        document.getElementById('new-name').value = '';
        document.getElementById('new-price').value = '';
        document.getElementById('new-image').value = '';
        loadWatches();
    } else {
        alert('Failed to add watch.');
    }
}

// ─── DELETE WATCH ─────────────────────────────────────────
async function deleteWatch(id) {
    if (!confirm('Are you sure you want to delete this watch?')) return;

    const res = await fetch(`${API}/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) loadWatches();
    else alert('Failed to delete.');
}

// ─── EDIT WATCH ───────────────────────────────────────────
function openEditModal(id, name, price) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-image').value = '';
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const price = document.getElementById('edit-price').value.trim();
    const imageFile = document.getElementById('edit-image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        body: formData
    });

    if (res.ok) {
        closeEditModal();
        loadWatches();
    } else {
        alert('Failed to save changes.');
    }
}