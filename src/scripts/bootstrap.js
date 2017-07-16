import mongoose from 'mongoose';
import bluebird from 'bluebird';
import bcrypt from 'bcrypt-nodejs';
import env from 'dotenv';
import {
  User,
  Raid
} from '../server/app/shared/models';

env.config();

mongoose.Promise = bluebird;


let dbURL;

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

switch (process.env.NODE_ENV) {
  case 'test':
    dbURL = process.env.DB_CONNECTION_STRING_TEST;
    break;

  case 'docker':
    dbURL = process.env.DB_CONNECTION_STRING_DOCKER;
    break;

  default:
    dbURL = process.env.DB_CONNECTION_STRING_DEFAULT;
    break;
}

let user1;
let user2;

/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */

console.log(`Mongo connection: ${dbURL}`);

let hash1;

const deletedb = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(dbURL, () => {
      mongoose.connection.db.dropDatabase((err) => {
        if (!err) {
          console.log('Database dropped...');
          resolve();
        } else {
          reject(err);
        }
      });
    });
  });
};

const disconnect = () => {
  return new Promise((resolve, reject) => {
    mongoose.disconnect((err) => {
      if (!err) {
        console.log('Disconnected...');
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

const reconnect = () => {
  return new Promise((resolve, reject) => {
    mongoose.createConnection(dbURL, (err) => {
      if (!err) {
        console.log('Reconnected..');
        mongoose.connect(dbURL);
        resolve();
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
};

deletedb().then(disconnect)
  .then(reconnect)
  .then(() => new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, res) => {
      if (!err) {
        resolve(res);
      } else {
        reject('Error generating salt...');
      }
    });
  }))
  .then((salt) => new Promise((resolve, reject) => {
    bcrypt.hash('password', salt, null, (err, res) => {
      if (!err) {
        resolve(res);
      } else {
        reject('Error generating password');
      }
    });
  }))
  .then((res) => {
    hash1 = res;
    console.log(`Password: ${res}`);
    console.log('Creating first user...');
    return User.create({
      phone: '5555555555',
      profile: {
      },
      password: hash1,
    });
  })
  .then((user) => {
    user1 = user;
    console.log(`New user created (${user.profile.email})... now creating another user...`);
    return User.create({
      phone: '5556667777',
      profile: {
      },
      password: hash1,
    });
  })
  .then((user) => {
    user2 = user;
    console.log(`New user created (${user.profile.email})... now creating a raid...`);
    console.log('Finished bootstrapping.');
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
    return err;
  });
/* eslint-enable max-len */
/* eslint-enable no-underscore-dangle */
/* eslint-enable no-console */
