'use strict';

const _ = require('lodash');
const Joi = require('joi');

const AbstractService = require('./abstract-service');

module.exports = class DocCryptoService extends AbstractService {
  constructor(encryptor) {
    super({
      types: {}
    }, {
      types: Joi.object().pattern(/.*/, {
        fields: Joi.array().items(Joi.string().invalid('_id', '_ct', '_enc_v')).required(),
        current: Joi.number().required(),
        default: Joi.number().required(),
        versions: Joi.object().pattern(/\d+/, {
          key: Joi.string().required(),
          algorithm: Joi.string(),
          ivLength: Joi.number(),
          encoding: Joi.string()
        }),
        children: Joi.object().pattern(/.*/, Joi.string())
      })
    });

    this.encryptor = encryptor;
  }

  validateOptions(options) {
    super.validateOptions(options);

    //TODO Is it possible to handle this with Joi?
    if (options.types) {
      _.forEach(options.types, type => {
        if (!type.versions[type.current]) {
          throw new Error('Current version is not defined');
        }
        if (!type.versions[type.default]) {
          throw new Error('Default version is not defined');
        }
      });
    }
  }

  *encrypt(args) {
    this.validateArgs(args, {
      type: Joi.string().required().valid(_.keys(this.options.types)),
      doc: Joi.object().required()
    });

    const doc = args.doc;
    const typeDef = this.options.types[args.type];

    for (let childField in typeDef.children) {
      if (!doc[childField]) {
        continue;
      }

      let children = _.isArray(doc[childField]) ? doc[childField] : [doc[childField]];
      for (let child of children) {
        yield this.decrypt({
          type: typeDef.children[childField],
          doc: child
        });
      }
    }

    const version = typeDef.current;
    let algDef = typeDef.versions[version];

    const data = _.chain(doc)
      .pick(typeDef.fields)
      .omit(_.isUndefined)
      .value();

    // do not encrypt on nothing
    if (_.isEmpty(data)) {
      return {
        doc: doc
      };
    }

    doc._ct = yield this.encryptor.encrypt(data, algDef);
    doc._enc_v = version;

    _.forEach(typeDef.fields, field => delete doc[field]);

    return {
      doc: doc
    };
  }

  *decrypt(args) {
    this.validateArgs(args, {
      type: Joi.string().required().valid(_.keys(this.options.types)),
      doc: Joi.object().required()
    });

    const doc = args.doc;
    const typeDef = this.options.types[args.type];

    for (let childField in typeDef.children) {
      if (!doc[childField]) {
        continue;
      }

      let children = _.isArray(doc[childField]) ? doc[childField] : [doc[childField]];
      for (let child of children) {
        yield this.decrypt({
          type: typeDef.children[childField],
          doc: child
        });
      }
    }

    if (!doc._ct) {
      return {
        doc: doc
      };
    }

    let version = typeDef.default;
    if (doc._enc_v) {
      version = doc._enc_v;
    }

    let algDef = typeDef.versions[version];
    const decrypted = yield this.encryptor.decrypt(doc._ct, algDef);
    delete doc._ct;
    delete doc._enc_v;

    _.merge(doc, decrypted);

    return {
      doc: doc
    };
  }

};
