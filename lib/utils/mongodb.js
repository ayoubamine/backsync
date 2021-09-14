const { MongoClient } = require('mongodb');

module.exports = {
  async isValidConnectionString(uri) {
    try {
      const client = await MongoClient.connect(uri);

      await client.close();

      return true;
    } catch (err) {
      return false;
    }
  },
  async getDatabaseNames(uri) {
    const client = await MongoClient.connect(uri);
    const { databases } = await client.db().admin().listDatabases();
    const names = databases.map(({ name }) => name);

    await client.close();

    return names;
  },
};
