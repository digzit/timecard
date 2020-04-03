import { SlashCommand } from '@slack/bolt';
import moment from 'moment';
import _ from 'lodash';

import { Time, ITimeModel } from 'models/time';
import { Timesheet, ITimesheetModel } from 'models/timesheet';
import { DATE_FORMAT } from 'utils/constants';
import { Timestamp } from 'mongodb';

export default class AudioController {
  public addTime(command: SlashCommand) {
    return new Promise<ITimeModel>((resolve, reject) => {
      const newTime = new Time({
        user_id: command.user_id,
        user_name: command.user_name,
        type: command.text,
        created_date: moment().format(),
      });
      newTime.save((err, time) => {
        if (err) {
          reject(err);
        }
        resolve(time);
      });
    });
  }

  //TODO: add 2 timesheet if between 2 days
  public addTimesheet(command: SlashCommand) {
    return new Promise<ITimesheetModel>((resolve, reject) => {
      Time.findOne({ user_id: command.user_id }, (err, time) => {
        if (time?.type === 'in') {
          const now = moment();
          const start = moment(time.created_date);
          const newTimesheet = new Timesheet({
            user_id: time.user_id,
            user_name: time.user_name,
            duration: moment
              .utc(
                moment(now.format(DATE_FORMAT), DATE_FORMAT).diff(
                  moment(start.format(DATE_FORMAT), DATE_FORMAT)
                )
              )
              .format('H:mm:ss'),
            start_date: start,
            end_date: now.format(),
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

  public exportTimesheets(period: any, userId: any) {
    return new Promise<{ [key: string]: ITimesheetModel[] }>((resolve, reject) => {
      let end_date = {};
      switch (period) {
        case '1d':
          end_date = {
            $gte: new Date(moment().add(-1, 'days').startOf('day').format()),
            $lt: new Date(moment().add(-1, 'days').endOf('day').format()),
          };
          break;
        case 'today':
          end_date = {
            $gte: new Date(moment().startOf('day').format()),
            $lt: new Date(moment().endOf('day').format()),
          };
          break;
        default:
          end_date = {
            $gte: new Date(moment().startOf('isoWeek').format()),
            $lt: new Date(moment().format()),
          };
          break;
      }
      Timesheet.find({ end_date, user_id: userId }, (err, timesheets) => {
        const groupByDate = _.groupBy(timesheets, (item) =>
          moment(item.start_date).startOf('day').format(DATE_FORMAT)
        );
        Object.keys(groupByDate).length ? resolve(groupByDate) : reject('No data');
      });
    });
  }
}
