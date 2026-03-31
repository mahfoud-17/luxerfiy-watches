const mysql = require('mysql2');

const db = mysql.createConnection({
 host: 'localhost',
  user: 'root',
  password: '..00mmMM', // <-- Update this
  database: 'luxerify_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database.');
});

module.exports = db;