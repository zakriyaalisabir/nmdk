// config/database.js
const { isUndefined } = require('lodash');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connection.on('connected', () => {
  console.log('Connection Established');
});

mongoose.connection.on('reconnected', () => {
  console.log('Connection Reestablished');
});

mongoose.connection.on('disconnected', () => {
  console.log('Connection Disconnected');
});

mongoose.connection.on('close', () => {
  console.log('Connection Closed');
});

mongoose.connection.on('error', (error) => {
  console.log('ERROR: ' + error);
});

const URL = `${
  !isUndefined(process.env.MONGO_URL)
    ? process.env.MONGO_URL
    : 'mongodb://localhost:27017'
}/${!isUndefined(process.env.DB) ? process.env.DB : 'dev'}`;

const connect = async () => {
  const db=await mongoose.connect(URL, {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: 1000000,
    reconnectInterval: 3000,
  });
  db.coll
};

const establishConnection = async () => {
  connect()
    .then(() => 'Connected to DB')
    .catch((err) => console.log(err));
};

module.exports = { establishConnection };
