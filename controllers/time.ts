import { SlashCommand } from '@slack/bolt';
import moment from 'moment';

import { Time, ITimeModel } from 'models/time';
import { Timesheet, ITimesheetModel } from 'models/timesheet';

export default class AudioController {
  public addTime(command: SlashCommand) {
    return new Promise<ITimeModel>((resolve, reject) => {
      const newTime = new Time({
        user_id: command.user_id,
        user_name: command.user_name,
        type: command.text,
        created_date: moment().format('DD/MM/YYYY HH:mm:ss'),
      });
      newTime.save((err, time) => {
        if (err) {
          reject(err);
        }
        resolve(time);
      });
    });
  }

  public addTimesheet(command: SlashCommand) {
    return new Promise<ITimesheetModel>((resolve, reject) => {
      Time.findOne({ user_id: command.user_id }, (err, time) => {
        if (time?.type === 'in') {
          const now = moment().format('DD/MM/YYYY HH:mm:ss');
          const then = time.created_date;
          const newTimesheet = new Timesheet({
            user_id: time.user_id,
            user_name: time.user_name,
            duration: moment
              .utc(moment(now, 'DD/MM/YYYY HH:mm:ss').diff(moment(then, 'DD/MM/YYYY HH:mm:ss')))
              .format('HH:mm:ss'),
            start_date: then,
            end_date: now,
          });
          newTimesheet.save((err, timesheet) =>
            Time.deleteMany({ _id: time._id }, () => resolve(timesheet))
          );
        } else {
          reject('Please check in first');
        }
      })
        .sort({ _id: -1 })
        .limit(1);
    });
  }
}
