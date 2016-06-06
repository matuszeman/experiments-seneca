'use strict';

const AbstractService = require('./abstract-service');

module.exports = class CryptoFacade extends AbstractService {

  constructor(docCryptoService, bcryptService) {
    super();

    this.docCryptoService = docCryptoService;
    this.bcryptService = bcryptService;
  }

  mergeOptions(options) {
    this.docCryptoService.mergeOptions(options);
    this.bcryptService.mergeOptions(options);
  }

  encrypt(args) {
    return this.docCryptoService.encrypt(args);
  }

  decrypt(args) {
    return this.docCryptoService.decrypt(args);
  }

  bcryptHash(args) {
    return this.bcryptService.bcryptHash(args);
  }

  bcryptCheck(args) {
    return this.bcryptService.bcryptCheck(args);
  }

};

