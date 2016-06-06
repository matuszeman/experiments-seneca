'use strict';

const _ = require('lodash');
const Joi = require('joi');
const crypto = require('crypto');

const base64 = require('base64-arraybuffer');

class Encryptor {

  encrypt(data, opts) {
    opts = this.getOptions(opts);
    Joi.assert(data, Joi.object().required(), 'Parameter must be JSON object');
    return new Promise((resolve, reject) => {
      crypto.randomBytes(opts.ivLength, (err, iv) => {
        if (err) {
          return reject(err);
        }
        const cipher = crypto.createCipheriv(opts.algorithm, opts.keyBinary, iv);
        const jsonToEncrypt = JSON.stringify(data);
        cipher.end(jsonToEncrypt, opts.encoding, () => {
          const buffer = Buffer.concat([iv, cipher.read()]);
          let ret;
          switch (opts.format) {
            case 'base64':
              ret = buffer.toString('base64');
              break;
            default:
              throw new Error('Format not implemented');
              break;
          }
          resolve(ret);
        });
      });
    });
  }

  decrypt(hash, opts) {
    opts = this.getOptions(opts);

    let ctWithIV;
    switch (opts.format) {
      case 'base64':
        ctWithIV = base64.decode(hash);
        break;
      default:
        throw new Error('Format not implemented');
        break;
    }

    const ivLength = opts.ivLength;
    const iv = new Buffer(ctWithIV.slice(0, ivLength));
    const ct = new Buffer(ctWithIV.slice(ivLength, ctWithIV.length));

    const decipher = crypto.createDecipheriv(opts.algorithm, opts.keyBinary, iv);
    try {
      const decryptedObjectJSON = decipher.update(ct, undefined, opts.encoding) + decipher.final(opts.encoding);
      const decryptedObject = JSON.parse(decryptedObjectJSON);

      const ret = {};
      _.forOwn(decryptedObject, (decipheredVal, field) => {
        // JSON.parse returns {type: "Buffer", data: Buffer} for Buffers
        // https://nodejs.org/api/buffer.html#buffer_buf_tojson
        if (_.isObject(decipheredVal) && decipheredVal.type === 'Buffer') {
          ret[field] = decipheredVal.data;
        } else {
          ret[field] = decipheredVal;
        }
      });
      return Promise.resolve(ret);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getOptions(opts) {
    Joi.assert(opts, {
      key: Joi.string().required(),
      algorithm: Joi.string().valid('aes-256-cbc'),
      ivLength: Joi.number(),
      encoding: Joi.string(),
      format: Joi.string().valid('base64')
    });
    return _.defaults({}, opts, {
      keyBinary: new Buffer(opts.key, 'base64'),
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      encoding: 'utf-8',
      format: 'base64'
    });
  }
}

module.exports = Encryptor;
