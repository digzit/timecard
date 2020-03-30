import S3, { CompleteMultipartUploadOutput } from 'aws-sdk/clients/s3';
import fs from 'fs';
import path from 'path';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
});
const BUCKET = process.env.AWS_S3_BUCKET;

export async function uploadFile(file, name, bucketPath = '/') {
  return new Promise<CompleteMultipartUploadOutput>((resolve) => {
    console.log(bucketPath + name + path.extname(file.name));
    const params = {
      Bucket: BUCKET,
      Key: bucketPath + name + path.extname(file.name),
      Body: fs.readFileSync(file.path),
    };
    s3.upload(params, (s3Err, data) => {
      if (s3Err) throw s3Err;
      resolve(data);
    });
  });
}

export async function deleteFile(file) {
  return new Promise((resolve) => {
    const params = {
      Bucket: BUCKET,
      Key: file.key,
    };
    s3.deleteObject(params, (s3Err, data) => {
      if (s3Err) throw s3Err;
      resolve(data);
    });
  });
}
