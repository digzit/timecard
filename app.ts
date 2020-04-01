import { App } from '@slack/bolt';
import mongoose from 'mongoose';
import moment from 'moment';

import { TimeController } from 'controllers';
import reports from 'blocks/reports.json';
import { DATE_FORMAT } from 'utils/constants';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      MONGODB_URI: string;
      SLACK_SIGNING_SECRET: string;
      SLACK_BOT_TOKEN: string;
    }
  }
}
class Application {
  public app: App;
  public mongoUrl: string = process.env.MONGODB_URI;
  public TimeController = new TimeController();

  constructor() {
    this.app = new App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_TOKEN,
    });
    this.mongoSetup();
    this.listner();
    this.start();
  }

  private mongoSetup() {
    mongoose.Promise = global.Promise;
    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Successfully connected to the database');
      })
      .catch((err) => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
      });
  }

  private listner() {
    this.app.command('/check', async ({ command, ack, say, respond }) => {
      ack();
      try {
        switch (command.text) {
          case 'in':
            this.TimeController.addTime(command).then((newTime) =>
              say(
                `:clock8: <@${newTime.user_id}> check :white_check_mark: at ${moment(
                  newTime.created_date
                ).format(DATE_FORMAT)}`
              )
            );
            break;
          case 'out':
            this.TimeController.addTimesheet(command)
              .then((timesheet) =>
                say(
                  `:clock5: <@${timesheet.user_id}> check :heavy_check_mark:  at ${moment(
                    timesheet.end_date
                  ).format(DATE_FORMAT)}`
                )
              )
              .catch((error) => respond(`:warning: ${error}`));
            break;
          case 'reports':
            respond({
              text: `Select a period to see your timesheets`,
              blocks: reports,
            });
            break;
          default:
            respond(`:eyes: Command not found`);
            break;
        }
      } catch (error) {
        respond(`:warning: ${error}`);
      }
    });

    this.app.action(/(report_)([0-9])/g, async ({ action, body: { user }, ack, respond }) => {
      try {
        ack();
        const res = action as any;
        this.TimeController.exportTimesheets(res.value, user.id).then((timesheets) => {
          const blocks: any = [];
          let countPeriod = moment('00:00:00', 'H:mm:ss');
          const arrayDates = Object.keys(timesheets);
          arrayDates.map((date) => {
            const newBlock = {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${moment(date, 'DD/MM/YYYY').calendar().split(' at')[0]}* \n\n ${timesheets[
                  date
                ].map((timesheet) => {
                  countPeriod.add(moment.duration(timesheet.duration));
                  return `${moment(timesheet.start_date).format('h:mm a')} *TO* ${moment(
                    timesheet.end_date
                  ).format('h:mm a')} \n ${moment
                    .duration(timesheet.duration)
                    .hours()} hour(s) and ${moment
                    .duration(timesheet.duration)
                    .minutes()} minute(s) \n\n`;
                })}`.replace(',', ''),
              },
            };
            blocks.push(newBlock);
            blocks.push({ type: 'divider' });
          });
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:clipboard: Your times for *${
                res.text.text
              }*: ${countPeriod.hours()} hour(s) and ${countPeriod.minutes()} minute(s)`,
            },
          });
          respond({ text: 'Exports', blocks });
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  private start() {
    (async () => {
      const server: any = await this.app.start(process.env.PORT);
      console.log('⚡️ Bolt app is running!', server.address());
    })();
  }
}

export default new Application();
