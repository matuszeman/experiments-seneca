'use strict';

const _ = require('lodash');
const options = {
  initDelay: 1000,
  timeout: 10000
};

module.exports = {
  init() {
    return new Promise((resolve, reject) => {
      console.log(`Waiting ${options.initDelay}ms for test plugin to init`);//XXX
      setTimeout(function() {
        console.log('... test plugin ready');//XXX
        resolve();
      }, options.initDelay);
    });
  },

  //actions
  echo(args) {
    return args;
  },

  timeout(args) {
    return new Promise((resolve) => {
      setTimeout(resolve, this.options.timeout);
    });
  }
};