import { Request, Response } from 'express';

import { AudioController } from 'controllers';

export default class Routes {
  public AudioController = new AudioController();

  public routes(app) {
    app.route('/').get((req: Request, res: Response) => {
      res.status(200).send({ message: 'API ready' });
    });

    app.route('/audios').get(this.AudioController.getAll);
    app.route('/audio').post(this.AudioController.add);
    app.route('/audio/:slug').get(this.AudioController.getBySlug);
  }
}
