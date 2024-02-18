import 'dotenv/config';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Handler, ScheduledEvent } from 'aws-lambda';
import { exec } from 'child_process';
import { mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export const handler: Handler<ScheduledEvent> = async () => {
  try {
    console.info('Function init, backing up db...');

    const backupPath = await backup();

    console.info('Backup created, uploading to S3...');

    await upload(backupPath);

    console.info('Backup uploaded to S3, done.');
  } catch (error) {
    console.error(error);

    throw error;
  }
};

async function backup(): Promise<string> {
  mkdirSync('/tmp/backup', { recursive: true });

  return new Promise((resolve, reject) => {
    const [date] = new Date().toISOString().split('.');
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPort = process.env.DB_PORT;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;
    const mysqlDumpPath = join(__dirname, 'mysqldump');
    const outPath = `/tmp/${dbName}__${date}.sql`;

    const command = `${mysqlDumpPath} -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} --verbose ${dbName} > ${outPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);

        reject(error);

        return;
      }

      console.info(`stdout: ${stdout}`);
      console.info(`stderr: ${stderr}`);

      resolve(outPath);
    });
  });
}

async function upload(path: string): Promise<void> {
  const data = readFileSync(path);

  const client = new S3Client({
    region: process.env.BUCKET_REGION as string,
  });

  const fileName = path.replace('/tmp/', '');
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME as string,
    Key: fileName,
    Body: data,
    ContentType: 'application/zip',
  });

  await client.send(command);
}
