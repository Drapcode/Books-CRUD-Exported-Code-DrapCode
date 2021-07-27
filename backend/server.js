import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import compression from 'compression';

//Custom Routes Import
import router from './new_books/new_books.route';

require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({ limit: '50mb' }));
app.use(compression());

// Add CORS Setting
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
};

corsOptions.credentials = true;
app.use(cors(corsOptions));

app.use('/api/v1/', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to exchange application' });
});

const mongoUri = 'mongodb://localhost:27017/project_85k33u124wb766egb4xg6gb6676x';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to the database');
    app.enable('trust proxy');
  })
  .catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });

app.all('*', (err, req, res, next) => {
  next(err);
});
app.listen(process.env.APP_PORT, () => {
  console.log('Server is listening on port ' + process.env.APP_PORT);
});
