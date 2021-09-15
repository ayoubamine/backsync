const mysql = require('mysql2/promise');

module.exports = {
  async isValidCredentials(host, port, user, password) {
    try {
      const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
      });

      await connection.end();

      return true;
    } catch (err) {
      return false;
    }
  },
  async getDatabaseNames(host, port, user, password) {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    const [rows] = await connection.query('SHOW DATABASES');
    const names = rows.map(({ Database }) => Database);

    await connection.end();

    return names;
  },
};
