const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./app');

const DocCryptoService = require('./services/doc-crypto-service');
const BcryptService = require('./services/bcrypt-service');
const Encryptor = require('./services/encryptor');

const seneca = require('seneca')({
  tag: 'APP-local',
  timeout: 2000, // action timeout
  default_plugins: {
    basic: false,
    cluster: false,
    'mem-store': false,
    repl: false,
    transport: true,
    web: false
  }
});
seneca.options('./plugin-options.js');

seneca.use(require('./logger').plugin, {
  log: function(entry) {
    console.log(entry);//XXX
  }
});

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
  name: 'BcryptService'
});

seneca.use({
  init: SenecaFactory.createPlugin(new BcryptService(), {
    expose: ['generatorProgrammerError', 'generatorOperationalError', 'promiseProgrammerError', 'promiseOperationalError']
  }),
  name: 'Test'
});


seneca.ready(function() {
  const seneca = this;

  //const xx = seneca.find({role: 'BcryptService', cmd: 'bcryptHash'});
  //console.log('>>>>>>>>>', xx);//XXX

  const SenecaClient = require('./seneca').SenecaClient;
  const client = new SenecaClient(seneca);

  const di = {
    docCryptoService: function() {
      return SenecaFactory.createProxyService(
        'DocCryptoService',
        client
      );
    },
    bcryptService: function() {
      return SenecaFactory.createProxyService(
        'BcryptService',
        client
      );
    }
  };

  app(di);
});
