import { Schema, Document, Model, model } from 'mongoose';
import moment from 'moment';

const TimeSchema: Schema = new Schema({
  user_id: String,
  user_name: String,
  type: String,
  created_date: Date,
});

export interface ITimeModel extends Document {
  _id: string;
  user_id: string;
  user_name: string;
  type: 'in' | 'out';
  created_date: Date;
}

export const Time: Model<ITimeModel> = model('Time', TimeSchema);

export default TimeSchema;
