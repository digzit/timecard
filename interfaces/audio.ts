import { CompleteMultipartUploadOutput } from 'aws-sdk/clients/s3';

export interface IAudio {
  _id: string;
  name: string;
  slug: string;
  bucketS3: CompleteMultipartUploadOutput;
  tags: string[];
  created_date: Date;
}
