require('events').EventEmitter.defaultMaxListeners = 25;
// dot env
require('dotenv').config();
require('@babel/register')({
  presets: ['@babel/preset-env'],
});

require('./server');
