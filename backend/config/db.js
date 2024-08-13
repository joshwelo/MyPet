const mysql = require('mysql');

const db = mysql.createConnection({
  host: '3303',
  user: 'root',
  password: '753684159',
  database: 'mypetdb'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

module.exports = db;
