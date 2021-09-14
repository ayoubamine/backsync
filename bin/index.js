#! /usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');

const core = require('../lib/core');

function run() {
  clear();

  console.log(
    chalk.yellow(figlet.textSync('BackSync', { horizontalLayout: 'full' }))
  );

  program
    .name('backsync')
    .description('Backup and sync your data with ease.')
    .version('1.0.0');

  program
    .command('init')
    .description('generate a config file')
    .action(() => {
      core.init();
    });

  program
    .command('status')
    .description('show the sync history')
    .action(() => {
      core.status();
    });

  program
    .command('add <type>')
    .description('add source')
    .action((type) => {
      switch (type) {
        case 'backup':
          core.backup();
          break;

        case 'sync':
          core.sync();
          break;

        default:
          console.log("error: 'type' argument must be backup or sync");
          process.exit(1);
      }
    });

  program
    .command('delete <type>')
    .description('delete source')
    .action((type) => {
      switch (type) {
        case 'backup':
          core.deleteBackup();
          break;

        case 'sync':
          core.deleteSync();
          break;

        default:
          console.log("error: 'type' argument must be backup or sync");
          process.exit(1);
      }
    });

  program
    .command('run')
    .description('run the backup and sync manually')
    .action(() => {
      core.run();
    });

  program
    .command('schedule')
    .description('schedule the backup and sync to run automatically')
    .action(() => {
      core.schedule();
    });

  program
    .command('settings')
    .description('update default settings')
    .action(() => {
      core.settings();
    });

  program.parse(process.argv);
}

run();
