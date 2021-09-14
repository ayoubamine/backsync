const { nanoid } = require('nanoid');

module.exports = {
  CONFIG_FILE: 'backsync.json',
  TMP_DIR: `/tmp/${nanoid()}`,
  CRON_EXPRESSION: '0 0 * * *',
};
