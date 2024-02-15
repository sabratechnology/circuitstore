// /src/db.js

const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'circuitstore_live',
  password: 'Rajkumar@#2023',
  database: 'circuitstore_development',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
   // console.log('Connected to MySQL');
  }
});







module.exports = db;
