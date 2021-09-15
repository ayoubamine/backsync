# BackSync

> Backup and sync your data with ease.

Supported backup:

- Local
- MongoDB
- MySQL

Supported sync:

- Local
- Google Drive
- Dropbox
- AWS S3

## Install

```bash
npm i -g @ayoubamine/backsync
```

## Usage

Generate config file `backsync.json`:

```bash
backsync init
```

Add backup source:

```bash
backsync add backup
```

Add sync source:

```bash
backsync add sync
```

Update default settings:

```bash
backsync settings
```

Run the backup and sync manually:

```bash
backsync run
```

Schedule the backup and sync in the [background](#process-management):

```bash
backsync schedule
```

Show the sync history:

```bash
backsync status
```

## Process Management

Install PM2 to run the process in the background:

```bash
npm i -g pm2
```

Create `ecosystem.config.js` file in the same directory that `backsync.json` exists and add the following content:

```js
module.exports = {
  apps: [
    {
      name: 'backsync',
      script: 'backsync',
      args: 'schedule',
    },
  ],
};
```

Then to start:

```bash
pm2 start ecosystem.config.js
```

Display the logs:

```bash
pm2 logs backsync
```

To stop and delete:

```bash
pm2 delete backsync
```

## Auth

### Google Drive

#### Step 1: Create service account

Follow these steps to create a service account and download your `credentials.json` file:
[Create service account](https://cloud.google.com/docs/authentication/production#create_service_account)

#### Step 2: Create backup folder

1. Go to <https://drive.google.com>.
2. Create new folder.
3. Right-click on the folder, select Share, add the service account email with the Editor permission and click Done.
4. Browse to the new folder and copy the folder id from the url. 'https://drive.google.com/drive/u/0/folders/FOLDER_ID'

### Dropbox

#### Step 1: Create an app in your Dropbox account

1. Go to <https://dropbox.com/developers/apps/create>.
2. Choose Scoped access on the first step.
3. Choose App folder on the second.
4. Give your app a name. That name will become a folder in your Dropbox account.
5. Click Create app.

#### Step 2: Generate access token

1. Go to Permissions tab and enable `files.content.write` scope.
1. Go to Settings tab, scroll down to OAuth 2 block, select 'No expiration' and click Generate.

### AWS S3

#### Step 1: AWS credentials

1. Go to <https://aws.amazon.com>.
2. Navigate to IAM > Users and click 'Add users'.
3. Fill the username, enable 'Access key - Programmatic access', click 'Next: Permissions', select 'Attach existing policies directly', enable the AmazonS3FullAccess permission and click 'Next: Tags' > 'Next: Review'.

#### Step 2: Create an S3 bucket

1. Go to <https://s3.console.aws.amazon.com>.
2. Click 'Create bucket', fill the bucket name and click 'Create bucket'.

## API

### Info

| Name        | Type     | Required |
| ----------- | -------- | -------- |
| name        | `string` | Yes      |
| description | `string` | No       |

### Backup

#### Local

##### Params

| Name | Type     | Required |
| ---- | -------- | -------- |
| path | `string` | Yes      |

##### Settings

| Name     | Type     | Required                    |
| -------- | -------- | --------------------------- |
| filename | `string` | No, Default: Original name. |

#### MongoDB

##### Params

| Name     | Type     | Required                                 |
| -------- | -------- | ---------------------------------------- |
| uri      | `string` | No, Default: `mongodb://localhost:27017` |
| database | `string` | Yes                                      |

##### Settings

| Name     | Type     | Required                    |
| -------- | -------- | --------------------------- |
| filename | `string` | No, Default: Database name. |

#### MySQL

##### Params

| Name     | Type     | Required                |
| -------- | -------- | ----------------------- |
| host     | `string` | No, Default: `hostname` |
| port     | `number` | No, Default: `3306`     |
| user     | `string` | No, Default: `root`     |
| password | `string` | No                      |
| database | `string` | Yes                     |

##### Settings

| Name     | Type     | Required                    |
| -------- | -------- | --------------------------- |
| filename | `string` | No, Default: Database name. |

### Sync

#### Local

| Name | Type     | Required |
| ---- | -------- | -------- |
| path | `string` | Yes      |

#### GDrive

| Name                         | Type     | Required |
| ---------------------------- | -------- | -------- |
| [credentials](#google-drive) | `string` | Yes      |
| [folderId](#google-drive)    | `string` | Yes      |

#### Dropbox

| Name              | Type     | Required |
| ----------------- | -------- | -------- |
| [token](#dropbox) | `string` | Yes      |

#### AWS S3

| Name                       | Type     | Required |
| -------------------------- | -------- | -------- |
| [accessKeyId](#aws-s3)     | `string` | Yes      |
| [secretAccessKey](#aws-s3) | `string` | Yes      |
| [bucketName](#aws-s3)      | `string` | Yes      |

### Settings

| Name     | Type     | Required                 |
| -------- | -------- | ------------------------ |
| cron     | `string` | No, Default: `0 0 * * *` |
| prefix   | `string` | No                       |
| filename | `string` | No                       |

## Contributions

Feel free to contribute to this project.

If you find a bug or want a feature, but don't know how to fix/implement it, please fill an [issue](https://github.com/ayoubamine/backsync/issues).
If you fixed a bug or implemented a new feature, please send a [pull request](https://github.com/ayoubamine/backsync/pulls).

## Changelog

[CHANGELOG](./CHANGELOG.md)

## License

[MIT License](./LICENSE.md)
