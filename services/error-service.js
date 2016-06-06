'use strict';
const Boom = require('boom');
const Joi = require('joi');
const AbstractService = require('./abstract-service');

module.exports = class ErrorService extends AbstractService {

  *generatorProgrammerError(args) {
    error
  }

  *generatorOperationalError(args) {
    throw Boom.badRequest('User operational exception - badRequest', {
      some: 'data',
      another: 1
    });
  }

  *generatorArgValidationError(args) {
    this.validateArgs(args, {
      mandatory: Joi.string().required()
    });

    // if mandatory arg is not provided this should not run
    XXXshouldnotrun;
  }

  promiseProgrammerError(args) {
    return this.promiseMethod(args, {}, () => {
      error
    });
  }

  promiseOperationalError(args) {
    return Promise.reject(Boom.badImplementation('User operational promise error - badImplementation', {
      server: 'error',
      too: 'bad'
    }));
  }

  promiseArgValidationError(args) {
    return this.promiseMethod(args, {
      mandatory: Joi.string().required()
    }, (args) => {
      // if mandatory arg is not provided this should not run
      XXXshouldnotrun;
    });
  }

};
