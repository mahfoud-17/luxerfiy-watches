const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
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

// Make uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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
        if (err) return res.status(500).send({error: 'DB Error'});
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, image } = req.body;

    if (!name || !price || !image) return res.status(400).send('Missing fields');

    db.query('INSERT INTO products (name, price, image) VALUES (?, ?, ?)',
        [name, parseInt(price), image],
        (err) => {
            if (err) return res.status(500).json({error: 'database Error'});
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
                if (err) return res.status(500).json({error: 'database Error'});
                res.json({ success: true });
            }
        );
    } else {
        db.query('UPDATE products SET name=?, price=? WHERE id=?',
            [name, parseInt(price), id],
            (err) => {
                if (err) return res.status(500).json({error: 'database Error'});
                res.json({ success: true });
            }
        );
    }
});

app.delete('/api/products/:id', (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({error: 'database Error'});
        res.json({ success: true });
    });
});

// ─── ORDERS ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: 'a6b113001@smtp-brevo.com',
        pass: 'xsmtpsib-f37ba59f1cede1365aa70fa6ec312d2d9fa6d347b45c035cde0b2d5d01c9c5d7-utphpVf72PSGmzHk'
    }
});

app.post('/api/order', (req, res) => {
    const { name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product } = req.body;

    const query = `INSERT INTO orders 
        (name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, email, phone, wilaya, delivery_type, delivery_office, address, delivery_price, total_price, product], (err) => {
        if (err) {
            console.error("MySQL Error:", err);
            return res.status(500).send("Database Error");
        }

        const mailOptions = {
            from: 'mahfoudbelarbi2006@gmail.com',
            to: email,
            subject: 'Order Confirmation - Luxerify',
            text: `
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
Email:            ${email}
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
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("EMAIL ERROR:", error);
            else console.log("EMAIL SENT:", info.response);
        });

        res.send("Order Saved!");
    });
});

app.listen(PORT, () => {
    console.log(`Server running on https://luxerfiy-watches.onrender.com:${PORT}`);
});