'use strict';

const SenecaFactory = require('./seneca').SenecaFactory;
const DocCryptoService = require('./services/doc-crypto-service');
const BcryptService = require('./services/bcrypt-service');
const ErrorService = require('./services/error-service');
const Encryptor = require('./services/encryptor');

let seneca = require('seneca')();
seneca.options('./plugin-options.js');

seneca.use({
  init: SenecaFactory.createPlugin(new DocCryptoService(new Encryptor()), {
    //role: 'DocCryptoService', //exposes this service under this role - default to service class name
    expose: ['encrypt', 'decrypt']
  }),
  name: 'DocCryptoService' //local name used by seneca to fetch appropriate plugin options from plugin-options.js file
});

seneca.use({
  init: SenecaFactory.createPlugin(new BcryptService(), {
    expose: ['bcryptHash', 'bcryptCheck']
  }),
  name: 'BcryptService' //local name used by seneca to fetch appropriate plugin options from plugin-options.js file
});

seneca.use({
  init: SenecaFactory.createPlugin(new ErrorService(), {
    expose: [
      'promiseOperationalError', 'promiseProgrammerError', 'generatorOperationalError', 'generatorProgrammerError',
      'generatorArgValidationError', 'promiseArgValidationError']
  }),
  name: 'ErrorService' //local name used by seneca to fetch appropriate plugin options from plugin-options.js file
});

seneca.ready(function() {
  seneca.listen({
    type: 'tcp',
    port: 10202
  });
});