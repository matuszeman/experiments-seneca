'use strict';

const _ = require('lodash');
const AbstractService = require('./abstract-service');

module.exports = class Events extends AbstractService {
  constructor() {
    super({
      initDelay: 1000,
      timeout: 10000
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      console.log(`Waiting ${this.options.initDelay}ms for test plugin to init`);//XXX
      setTimeout(function() {
        console.log('... test plugin ready');//XXX
        resolve();
      }, this.options.initDelay);
    });
  }

  //actions
  echo(args) {
    return args;
  }

  timeout(args) {
    return new Promise((resolve) => {
      setTimeout(resolve, this.options.timeout);
    });
  }
};