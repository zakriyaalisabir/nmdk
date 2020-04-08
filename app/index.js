require('dotenv').config({ debug: process.env.DEBUG });

const path = require('path');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
const marked = require('marked');
const minio = require('minio');

const app = express();
const DB = process.env.DB || 'dev';
const port = process.env.PORT || 3333;
const mongoURL = `${process.env.MONGO_URL}` || 'mongodb://127.0.0.1:27017';
const minioHost = process.env.MINIO_HOST || 'localhost';
const minioBucket = 'image-storage';

class Server {
  constructor() {
    this.initMongo = this.bind(this.initMongo);
    this.initMinIO = this.bind(this.initMinIO);
    this.start = this.bind(this.start);
    this.saveNote = this.bind(this.saveNote);
    this.retrieveNotes = this.bind(this.retrieveNotes);
  }
  static async initMongo() {
    console.log('Initialising MongoDB...');
    let success = false;
    let client;
    while (!success) {
      try {
        client = await MongoClient.connect(mongoURL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('.....');
        success = true;
      } catch (err) {
        const TIMEOUT = 1000; //ms
        console.log(`MongoDB ${err}, Retrying ....`);
        await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
      }
    }
    console.log('MongoDB initialised');
    return client.db(DB).collection('notes');
  }

  static async initMinIO() {
    console.log('Initialising MinIO...');
    const client = new minio.Client({
      endPoint: minioHost,
      port: process.env.MINIO_PORT,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    let success = false;
    while (!success) {
      try {
        if (!(await client.bucketExists(minioBucket))) {
          await client.makeBucket(minioBucket);
        }
        success = true;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    console.log('MinIO initialised');
    return client;
  }

  static async start() {
    const db = await this.initMongo();
    const minio = await this.initMinIO();

    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', async (req, res) => {
      res.render('index', { notes: await this.retrieveNotes(db) });
    });

    app.post(
      '/note',
      multer({ storage: multer.memoryStorage() }).single('image'),
      async (req, res) => {
        if (!req.body.upload && req.body.description) {
          await this.saveNote(db, { description: req.body.description });
          res.redirect('/');
        } else if (req.body.upload && req.file) {
          await minio.putObject(
            minioBucket,
            req.file.originalname,
            req.file.buffer,
          );
          const link = `/img/${encodeURIComponent(req.file.originalname)}`;
          res.render('index', {
            content: `${req.body.description} ![](${link})`,
            notes: await this.retrieveNotes(db),
          });
        }
      },
    );

    app.get('/img/:name', async (req, res) => {
      const stream = await minio.getObject(
        minioBucket,
        decodeURIComponent(req.params.name),
      );
      stream.pipe(res);
    });

    app.listen(port, () => {
      console.log(`App listening on http://localhost:${port}`);
    });
  }

  static async saveNote(db, note) {
    await db.insertOne(note);
  }

  static async retrieveNotes(db) {
    const notes = (await db.find().toArray()).reverse();
    return notes.map((it) => {
      return { ...it, description: marked(it.description) };
    });
  }
}

module.exports = { Server };
