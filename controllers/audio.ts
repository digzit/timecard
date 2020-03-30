import * as mongoose from 'mongoose';
import slug from 'slug';
import shortid from 'shortid';

import { AudioSchema } from 'models';
import { uploadFile, deleteFile } from 'services/bucketS3';
import { IAudio } from 'interfaces/audio';

const Audio = mongoose.model('Audio', AudioSchema);

export default class AudioController {
  public add(req, res) {
    const fileName = `${slug(req.body.name)}-${shortid.generate()}`;
    uploadFile(req.files.file, fileName, 'audios/').then((file) => {
      let newAudio = new Audio({
        name: req.body.name,
        slug: fileName,
        tags: req.body.tags.split(','),
        bucketS3: file,
      });
      newAudio.save((err, audio) => {
        if (err) {
          res.send(err);
        }
        return res.json(audio);
      });
    });
  }

  public getAll(req, res) {
    Audio.find({}, (err, audio) => {
      if (err) {
        res.send(err);
      }
      res.json(audio);
    });
  }

  public delete(req, res) {
    Audio.findById(req.params.audioId, (err, audio: IAudio) => {
      if (err) {
        res.send(err);
      }
      audio?.bucketS3 &&
        deleteFile(audio.bucketS3).then(() => {
          Audio.deleteOne({ _id: audio._id }, (err) => {
            if (err) {
              res.send(err);
            }
            res.json({ succes: true });
          });
        });
    });
  }

  public getBySlug(req, res) {
    Audio.findOne({ slug: req.params.slug }, (err, audio: IAudio) => {
      if (err) {
        res.send(err);
      }
      res.json(audio);
    });
  }

  // public getById (req: Request, res: Response) {
  //   Audio.findById(req.params.audioId, (err, audio) => {
  //     if(err){
  //       res.send(err);
  //     }
  //     return res.json(audio);
  //   });
  // }

  // public update (req: Request, res: Response) {
  //   Audio.findOneAndUpdate({ _id: req.params.audioId }, req.body, { new: true }, (err, audio) => {
  //     if(err){
  //       res.send(err);
  //     }
  //     return res.json(audio);
  //   });
  // }
}
