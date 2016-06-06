'use strict';

const bcrypt = require('bcrypt');
const Joi = require('joi');

const AbstractService = require('./abstract-service');

module.exports = class BcryptService extends AbstractService {
  constructor(encryptor) {
    super({
      bcryptRounds: 10
    }, {
      bcryptRounds: Joi.number()
    });

    this.encryptor = encryptor;
  }

  bcryptHash(args) {
    return this.promiseMethod(args, {
      value: Joi.string().required()
    }, (args) => {
      return new Promise((resolve, reject) => {
        bcrypt.hash(args.value, this.options.bcryptRounds, (err, hash) => {
          if (err) {
            return reject(err);
          }
          resolve({
            hash: hash
          });
        });
      });
    });
  }

  bcryptCheck(args) {
    return this.promiseMethod(args, {
      value: Joi.string().required(),
      hash: Joi.string().required()
    }, (args) => {
      return new Promise((resolve, reject) => {
        bcrypt.compare(args.value, args.hash, (err, ret) => {
          if (err) {
            return reject(err);
          }

          resolve({
            check: ret
          });
        });
      });
    });
  }

};