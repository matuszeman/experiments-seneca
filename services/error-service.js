'use strict';

const AbstractService = require('./abstract-service');

module.exports = class ErrorService extends AbstractService {

  *generatorProgrammerError(args) {
    error
  }

  *generatorOperationalError(args) {
    throw new Error('User operational exception');
  }

  promiseProgrammerError(args) {
    return this.promiseMethod(args, {}, () => {
      error
    });
  }

  promiseOperationalError(args) {
    return Promise.reject(new Error('User operational promise error'));
  }

};
