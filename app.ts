import express from 'express';
import mongoose from 'mongoose';
import formData from 'express-form-data';
import os from 'os';
import cors from 'cors';

import Routes from 'routes';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      MONGODB_URI: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_ACCESS_KEY: string;
      AWS_S3_BUCKET: string;
    }
  }
}
class App {
  public app: express.Application;
  public routePrv: Routes = new Routes();
  public mongoUrl: string = process.env.MONGODB_URI;

  constructor() {
    this.app = express();
    this.config();
    this.mongoSetup();
    this.routePrv.routes(this.app);
  }

  private config(): void {
    this.app.use(
      formData.parse({
        uploadDir: os.tmpdir(),
        autoClean: true,
      })
    );
    this.app.use(cors('*'));
  }

  private mongoSetup(): void {
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
}

export default new App().app;
