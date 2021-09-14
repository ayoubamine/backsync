const inquirer = require('inquirer');
const { PathPrompt } = require('inquirer-path');
const cron = require('node-cron');
const path = require('path');

inquirer.registerPrompt('path', PathPrompt);

const { CRON_EXPRESSION } = require('./config');
const files = require('./utils/files');
const mongodb = require('./utils/mongodb');

module.exports = {
  askInfo() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter your project name:',
        validate: (value) => !!value,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter your project description:',
      },
    ]);
  },
  async askBackupSource() {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        choices: ['Local', 'MongoDB'],
      },
    ]);

    let params;
    let settings;

    switch (type) {
      case 'Local': {
        params = await inquirer.prompt([
          {
            type: 'path',
            name: 'path',
            message: 'Enter the path of the file/directory:',
          },
        ]);

        const defaultValue = path.basename(params.path);
        const { filename } = await inquirer.prompt([
          {
            type: 'input',
            name: 'filename',
            message: 'Enter the filename of the backup file:',
            default: defaultValue,
          },
        ]);

        if (filename !== defaultValue) {
          settings = { filename };
        }
        break;
      }

      case 'MongoDB': {
        params = await inquirer.prompt([
          {
            type: 'input',
            name: 'uri',
            message: 'Enter the connection string:',
            default: 'mongodb://localhost:27017',
            validate: async (value) => {
              if (value.length) {
                const result = await mongodb.isValidConnectionString(value);

                return result;
              }

              return false;
            },
          },
        ]);

        const { database } = await inquirer.prompt([
          {
            type: 'list',
            name: 'database',
            message: 'Select the database name:',
            choices: await mongodb.getDatabaseNames(params.uri),
          },
        ]);

        params.database = database;

        const { filename } = await inquirer.prompt([
          {
            type: 'input',
            name: 'filename',
            message: 'Enter the filename of the backup file:',
            default: database,
          },
        ]);

        if (filename !== database) {
          settings = { filename };
        }
        break;
      }

      default:
        break;
    }

    return { type, params, settings };
  },
  async askSyncSource() {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        choices: ['Local', 'GDrive', 'Dropbox'],
      },
    ]);
    let params;

    switch (type) {
      case 'Local':
        params = await inquirer.prompt([
          {
            type: 'path',
            name: 'path',
            message: 'Enter the path of the backup directory:',
            directoryOnly: true,
          },
        ]);
        break;

      case 'GDrive':
        params = await inquirer.prompt([
          {
            type: 'path',
            name: 'credentials',
            message: 'Enter the path of the credentials file:',
            validate: (value) => {
              if (files.isFile(value)) {
                return true;
              }

              return 'Please enter a valid credentials file.';
            },
          },
          {
            type: 'input',
            name: 'folderId',
            message: 'Enter the folder id:',
            validate: (value) => !!value,
          },
        ]);
        break;

      case 'Dropbox':
        params = await inquirer.prompt([
          {
            type: 'input',
            name: 'token',
            message: 'Enter the token of your Dropbox account:',
            validate: (value) => !!value,
          },
        ]);
        break;

      default:
        break;
    }

    return { type, params };
  },
  askSettings() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'cron',
        message: 'Enter your cron expression:',
        default: CRON_EXPRESSION,
        validate: (value) => cron.validate(value),
      },
      {
        type: 'confirm',
        name: 'stopOnError',
        message: 'Stop the backup/sync on error:',
        default: true,
      },
    ]);
  },
  async askSourceIndex(list) {
    const choices = list.map(({ type }, index) => `${index + 1} ${type}`);

    const { source } = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: 'Select a source:',
        choices,
      },
    ]);
    const index = choices.indexOf(source);

    return { index };
  },
};
