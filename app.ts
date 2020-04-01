import { App } from '@slack/bolt';
import mongoose from 'mongoose';
import moment from 'moment';

import { TimeController } from 'controllers';
import reports from 'blocks/reports.json';

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
              say(`:clock8: <@${newTime.user_id}> check *IN* at ${newTime.created_date}`)
            );
            break;
          case 'out':
            this.TimeController.addTimesheet(command)
              .then((timesheet) =>
                say(`:clock5: <@${timesheet.user_id}> check *OUT* at ${timesheet.end_date}`)
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
        respond(`You selected>`);
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
