const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mahfoudbelarbi2006@gmail.com', // <-- Replace with your sender email
    pass: 'upwf tefq zddi ytyt'     // <-- Replace with your Gmail App Password
  }
});

// Order Route
app.post('/api/order', (req, res) => {
  const { product, name, email, address } = req.body;

  // 1. Save to Database
  const sql = 'INSERT INTO orders (product, name, email, address) VALUES (?, ?, ?, ?)';
  db.query(sql, [product, name, email, address], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error saving order to database.' });
    }

    // 2. Send Email
    const mailOptions = {from: 'your_email@gmail.com',
      to: 'mahfoudbelarbi2006@gmail.com', // Target email requested
      subject: 'New Order - Luxerify Watches',
      text: `You have received a new order!\n\nProduct: ${product}\nCustomer Name: ${name}\nCustomer Email: ${email}\nDelivery Address: ${address}`
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Email error:', mailErr);
        // Even if email fails, order is saved, but we notify frontend
        return res.status(500).json({ message: 'Order saved, but email failed to send.' });
      }
      
      res.status(200).json({ message: 'Order placed successfully!' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});