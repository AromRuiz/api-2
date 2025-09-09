const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'interchange.proxy.rlwy.net',
  port: 31412,
  user: 'root',
  password: 'tvomgXVGyKIipWfzvEIlRjqpAzYZgESh',
  database: 'railway',
});

module.exports = pool.promise();