import { Schema, Document, Model, model } from 'mongoose';

const TimesheetSchema: Schema = new Schema({
  user_id: String,
  user_name: String,
  duration: String,
  start_date: Date,
  end_date: Date,
});

export interface ITimesheetModel extends Document {
  _id: string;
  user_id: string;
  user_name: string;
  duration: string;
  start_date: Date;
  end_date: Date;
}

export const Timesheet: Model<ITimesheetModel> = model('Timesheet', TimesheetSchema);

export default TimesheetSchema;
