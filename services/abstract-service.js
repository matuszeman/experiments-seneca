'use strict';

const _ = require('lodash');
const Joi = require('joi');

module.exports = class AbstractService {
  constructor(options, optionsSchema) {
    this.options = {};
    this.optionsSchema = optionsSchema || {};

    this._validateOptions(options || {}, this.optionsSchema);
    this.options = options;
  }

  mergeOptions(options) {
    this.validateOptions(options);
    _.merge(this.options, options);
  }

  validateOptions(options) {
    this._validateOptions(options, this.optionsSchema);
  }

  promiseMethod(args, schema, func) {
    const val = this.validateArgs(args, schema, true);
    if (val) {
      return val;
    }
    try {
      return func(args);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  validateArgs(args, schema, promise) {
    const ret = Joi.validate(args, schema, { stripUnknown: true });
    if (ret.error) {
      if (promise) {
        return Promise.reject(ret.error);
      }
      throw ret.error;
    }
    return false;
  }

  _validateOptions(options, schema) {
    const ret = Joi.validate(options, schema, { allowUnknown: true });
    if (ret.error) {
      throw ret.error;
    }
  }
};