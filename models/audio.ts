import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AudioSchema = new Schema({
  name: String,
  slug: String,
  bucketS3: {
    ETag: String,
    Location: String,
    key: String,
  },
  tags: [
    {
      type: String,
    },
  ],
  created_date: {
    type: Date,
    default: Date.now,
  },
});

export default AudioSchema;
