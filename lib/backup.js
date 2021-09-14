const archiver = require('archiver');
const { customAlphabet } = require('nanoid');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const { TMP_DIR } = require('./config');
const files = require('./utils/files');

function generateFileName(name, ext) {
  if (!files.isDirectory(TMP_DIR)) {
    files.createDirectory(TMP_DIR);
  }

  const nanoid = customAlphabet('0123456789abcdef', 10);

  return `${TMP_DIR}/${name}-${nanoid()}.${ext}`;
}

module.exports = {
  async local(params, settings = {}) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const name = settings.filename || path.basename(params.path);
    const out = generateFileName(name, 'zip');
    const stream = fs.createWriteStream(out);

    if (files.isFile(params.path)) {
      archive.file(params.path, { name: path.basename(params.path) });
    } else {
      archive.directory(params.path, path.basename(params.path));
    }

    return new Promise((resolve, reject) => {
      stream.on('close', () => resolve(out));
      archive.on('error', (err) => reject(err)).pipe(stream);
      archive.finalize();
    });
  },
  async mongoDB(params, settings = {}) {
    const name = settings.filename || params.database;
    const out = generateFileName(name, 'gz');
    const backupProcess = spawn('mongodump', [
      `--uri=${params.uri}/${params.database}`,
      `--archive=${out}`,
      '--gzip',
    ]);

    return new Promise((resolve, reject) => {
      backupProcess.on('exit', (code, signal) => {
        if (code || signal) {
          reject();
        } else {
          resolve(out);
        }
      });
    });
  },
  clean() {
    if (files.isDirectory(TMP_DIR)) {
      files.removeDirectory(TMP_DIR);
    }
  },
};
