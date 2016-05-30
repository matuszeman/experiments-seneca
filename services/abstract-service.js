'use strict';

const _ = require('lodash');

module.exports = class AbstractService {
  constructor(opts) {
    this.options = opts || {};
  }

  mergeOptions(options) {
    _.merge(this.options, options);
  }
}