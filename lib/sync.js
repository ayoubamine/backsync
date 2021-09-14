const { google } = require('googleapis');
const { Dropbox } = require('dropbox');
const path = require('path');
const fs = require('fs');

const files = require('./utils/files');

module.exports = {
  async local(backup, params) {
    const dest = path.join(params.path, path.basename(backup));

    files.copyFile(backup, dest);

    return dest;
  },
  async gDrive(backup, params) {
    const auth = new google.auth.GoogleAuth({
      keyFile: params.credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: path.basename(backup),
      parents: [params.folderId],
    };

    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(backup),
    };

    const { data } = await drive.files.create({
      resource: fileMetadata,
      media,
    });

    return data.name;
  },
  async dropbox(backup, params) {
    const dbx = new Dropbox({ accessToken: params.token });

    const { result } = await dbx.filesUpload({
      path: `/${path.basename(backup)}`,
      contents: fs.createReadStream(backup),
    });

    return result.name;
  },
};
