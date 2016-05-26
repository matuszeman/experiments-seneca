'use strict';

const _ = require('lodash');

module.exports = class Events {
  constructor() {
    this.options = {
      initDelay: 1000,
      timeout: 10000
    };
  }

  init() {
    return new Promise((resolve, reject) => {
      console.log(`Waiting ${this.options.initDelay}ms for test plugin to init`);//XXX
      setTimeout(function() {
        console.log('... test plugin ready');//XXX
        resolve();
      }, options.initDelay);
    });
  }

  mergeOptions(options) {
    _.merge(this.options, options);
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