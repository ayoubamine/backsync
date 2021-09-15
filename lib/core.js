const cron = require('node-cron');
const cronstrue = require('cronstrue');
const Table = require('cli-table3');
const chalk = require('chalk');

const { CONFIG_FILE, TMP_DIR, CRON_EXPRESSION } = require('./config');
const inquirer = require('./inquirer');
const backup = require('./backup');
const sync = require('./sync');
const files = require('./utils/files');
const db = require('./utils/db');

module.exports = {
  async init() {
    if (files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file already exists!'));
      process.exit(1);
    }

    const info = await inquirer.askInfo();
    const config = {
      info,
      backup: [],
      sync: [],
      settings: {},
    };

    files.writeJsonFile(CONFIG_FILE, config);
  },
  async status() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const rows = await db.getData();
    const table = new Table({
      head: ['Type', 'File', 'Date'],
    });

    rows.forEach(({ type, file, date }) => {
      table.push([type, file, date]);
    });

    console.log(table.toString());
  },
  async backup() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);
    const source = await inquirer.askBackupSource();

    config.backup.push(source);

    files.writeJsonFile(CONFIG_FILE, config);
  },
  async deleteBackup() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);

    if (config.backup.length) {
      const { index } = await inquirer.askSourceIndex(config.backup);

      config.backup.splice(index, 1);

      files.writeJsonFile(CONFIG_FILE, config);
    }
  },
  async sync() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);
    const source = await inquirer.askSyncSource();

    config.sync.push(source);

    files.writeJsonFile(CONFIG_FILE, config);
  },
  async deleteSync() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);

    if (config.sync.length) {
      const index = await inquirer.askSourceIndex(config.sync);

      config.sync.splice(index, 1);

      files.writeJsonFile(CONFIG_FILE, config);
    }
  },
  async run(options = { header: true }) {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);

    if (options.header) {
      console.log(chalk.bold('Backup name:'), chalk.blue(config.info.name));
    }

    console.log(chalk.yellow('\nBackup...'));

    if (!config.backup.length) {
      return console.log(chalk.red('[-] No source found!'));
    }

    const backups = [];

    for (const source of config.backup) {
      let out;

      try {
        switch (source.type) {
          case 'Local':
            out = await backup.local(source.params, source.settings);
            break;

          case 'MongoDB':
            out = await backup.mongoDB(source.params, source.settings);
            break;

          case 'MySQL':
            out = await backup.mysql(source.params, source.settings);
            break;

          default:
            break;
        }

        backups.push(out);

        console.log(chalk.green(`[+] ${source.type}`));
      } catch (err) {
        console.log(chalk.red(`[-] ${source.type}`));
      }
    }

    if (!backups.length) {
      return;
    }

    console.log(chalk.yellow('\nSync...'));

    if (!config.sync.length) {
      return console.log(chalk.red('[-] No source found!'));
    }

    const file = await files.zipFiles(TMP_DIR, backups);

    for (const source of config.sync) {
      let out;

      try {
        switch (source.type) {
          case 'Local':
            out = await sync.local(file, source.params);
            break;

          case 'GDrive':
            try {
              out = await sync.gDrive(file, source.params);
            } catch (err) {
              console.log(err.message);
            }
            break;

          case 'Dropbox':
            try {
              out = await sync.dropbox(file, source.params);
            } catch (err) {
              console.log(err.error);
            }
            break;

          default:
            break;
        }

        await db.recordData(source.type, out);

        console.log(chalk.green(`[+] ${source.type}`));
      } catch (err) {
        console.log(chalk.red(`[-] ${source.type}`));
      }
    }

    backup.clean();
  },
  schedule() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);
    const cronExpression = config.settings.cron || CRON_EXPRESSION;
    const cronHuman = cronstrue.toString(cronExpression);

    console.log(chalk.bold('Backup name:'), chalk.blue(config.info.name));

    console.log(chalk.yellow('\nRunning...'), `(${cronHuman})`);

    cron.schedule(cronExpression, () => {
      this.run({ header: false });
    });
  },
  async settings() {
    if (!files.isFile(CONFIG_FILE)) {
      console.log(chalk.red('Config file not found!'));
      process.exit(1);
    }

    const config = files.readJsonFile(CONFIG_FILE);
    const settings = await inquirer.askSettings();

    config.settings = settings;

    files.writeJsonFile(CONFIG_FILE, config);
  },
};
