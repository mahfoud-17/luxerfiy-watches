const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ─── SEND EMAIL VIA BREVO API ─────────────────────────────
async function sendEmail(to, name, product, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price) {
    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'Luxerify', email: 'mahfoudbelarbi2006@gmail.com' },
            to: [{ email: to }],
            subject: 'Order Confirmation - Luxerify',
            textContent: `
Thank you for your order, ${name}!

━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Product:          ${product}
━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFO
━━━━━━━━━━━━━━━━━━━━━━
Name:             ${name}
Phone:            ${phone}
Email:            ${to}
━━━━━━━━━━━━━━━━━━━━━━
DELIVERY INFO
━━━━━━━━━━━━━━━━━━━━━━
Delivery Type:    ${delivery_type}
Wilaya:           ${wilaya}
Delivery Office:  ${delivery_office}
Address:          ${address}
━━━━━━━━━━━━━━━━━━━━━━
PRICING
━━━━━━━━━━━━━━━━━━━━━━
Delivery Price:   ${delivery_price} DA
Total Price:      ${total_price} DA
━━━━━━━━━━━━━━━━━━━━━━

We will contact you shortly to confirm your delivery.

- Luxerify Team
            `
        }, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log("EMAIL SENT");
    } catch (error) {
        console.error("EMAIL ERROR:", error.response?.data || error.message);
    }
}

// ─── ADMIN AUTH ───────────────────────────────────────────
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'luxerify2024';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ─── PRODUCTS ─────────────────────────────────────────────
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !price || !image) return res.status(400).send('Missing fields');
    db.query('INSERT INTO products (name, price, image) VALUES (?, ?, ?)',
        [name, parseInt(price), image],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database Error' });
            res.json({ success: true });
        }
    );
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { name, price } = req.body;
    const { id } = req.params;
    if (req.file) {
        const image = `/uploads/${req.file.filename}`;
        db.query('UPDATE products SET name=?, price=?, image=? WHERE id=?',
            [name, parseInt(price), image, id],
            (err) => {
                if (err) return res.status(500).json({ error: 'Database Error' });
                res.json({ success: true });
            }
        );
    } else {
        db.query('UPDATE products SET name=?, price=? WHERE id=?',
            [name, parseInt(price), id],
            (err) => {
                if (err) return res.status(500).json({ error: 'Database Error' });
                res.json({ success: true });
            }
        );
    }
});

app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Database Error' });
        res.json({ success: true });
    });
});

// ─── ORDERS ───────────────────────────────────────────────
app.post('/api/order', async (req, res) => {
    const { name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product } = req.body;

    const query = `INSERT INTO orders 
        (name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product], async (err) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).send("Database Error");
        }

        await sendEmail(email, name, product, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price);

        res.send("Order Saved!");
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});