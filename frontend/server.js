import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import applicationRoute from './application/application.route.js';

require('dotenv').config();
const compression = require('compression');
const path = require('path');

//Add Express Setting
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(compression());

app.use('/resources', express.static(path.join(__dirname, 'public')));
app.set('views', `views`);
app.set('view engine', 'hbs');

//Add Mongoose configuration
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
  })
  .catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
};

corsOptions.credentials = true;
app.use(cors(corsOptions));

//Application Route
app.use('/', applicationRoute);

// define a simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to exchange application' });
});

app.all('*', (err, req, res, next) => {
  next(err);
});

// listen for requests
app.listen(process.env.APP_PORT, () => {
  console.log('Server is listening on port ' + process.env.APP_PORT);
});
