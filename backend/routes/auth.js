const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mypetdb'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE useremail = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }

    if (results.length > 0) {
      const user = results[0];
      if (password === user.userpassword) { // Plain text comparison
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      res.json({ success: false, message: 'Invalid email or password' });
    }
  });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const query = 'INSERT INTO users (username, useremail, userpassword) VALUES (?, ?, ?)';
  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user into database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

router.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  const userQuery = 'SELECT username, useremail FROM users WHERE userid = ?';
  const petsQuery = 'SELECT petname, breed, birthday FROM pets WHERE userid = ?';

  db.query(userQuery, [userId], (err, userResults) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResults[0];

    db.query(petsQuery, [userId], (err, petsResults) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ success: false, message: 'Database query error' });
      }

      res.json({ success: true, user, pets: petsResults });
    });
  });
});

module.exports = router;
