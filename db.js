const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'tvomgXVGyKIipWfzvEIlRjqpAzYZgESh',
  database: 'railway',
});

module.exports = pool.promise();