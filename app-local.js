const app = require('./app');
const options = require('./plugin-options');

const DocCryptoService = require('./services/doc-crypto-service');
const Encryptor = require('./services/encryptor');
const BcryptService = require('./services/bcrypt-service');

const dic = {
  docCryptoService: function() {
    const ins = new DocCryptoService(new Encryptor());
    ins.mergeOptions(options.DocCryptoService);
    return ins;
  },
  bcryptService: function() {
    const ins = new BcryptService();
    ins.mergeOptions(options.BcryptService);
    return ins;
  }
};

app(dic);