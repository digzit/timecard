import { Schema, Document, Model, model } from 'mongoose';

const TimesheetSchema: Schema = new Schema({
  user_id: String,
  user_name: String,
  duration: String,
  start_date: String,
  end_date: String,
});

export interface ITimesheetModel extends Document {
  _id: string;
  user_id: string;
  user_name: string;
  duration: string;
  start_date: string;
  end_date: string;
}

export const Timesheet: Model<ITimesheetModel> = model('Timesheet', TimesheetSchema);

export default TimesheetSchema;
