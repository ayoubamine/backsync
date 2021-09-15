const archiver = require('archiver');
const { join, basename } = require('path');
const fs = require('fs');

module.exports = {
  isFile(path) {
    try {
      return fs.statSync(path).isFile();
    } catch (err) {
      return false;
    }
  },
  isDirectory(path) {
    try {
      return fs.statSync(path).isDirectory();
    } catch (err) {
      return false;
    }
  },
  createDirectory(path) {
    fs.mkdirSync(path, { recursive: true });
  },
  removeDirectory(path) {
    fs.rmdirSync(path, { recursive: true });
  },
  copyFile(src, dest) {
    fs.copyFileSync(src, dest);
  },
  readJsonFile(path) {
    const rawData = fs.readFileSync(path);
    const data = JSON.parse(rawData);

    return data;
  },
  writeJsonFile(path, data) {
    const content = `${JSON.stringify(data, null, 2)}\n`;

    fs.writeFileSync(path, content);
  },
  zipFiles(path, files, options = {}) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = options.filename || Date.now();
    const out = join(path, `${options.prefix || ''}${filename}.zip`);
    const stream = fs.createWriteStream(out);

    for (const file of files) {
      archive.file(file, { name: basename(file) });
    }

    return new Promise((resolve, reject) => {
      stream.on('close', () => resolve(out));
      archive.on('error', (err) => reject(err)).pipe(stream);
      archive.finalize();
    });
  },
};
