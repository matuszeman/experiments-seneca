const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./app');

const seneca = require('seneca')({
  tag: 'APP-remote',
  timeout: 3000, // action timeout
  default_plugins: {
    basic: false,
    cluster: false,
    'mem-store': false,
    repl: false,
    transport: true,
    web: false
  }
});

seneca.use(require('./logger').plugin , {
  log: function(entry) {
    console.log(entry);//XXX
  }
});

seneca.client({
  type: 'tcp',
  port: 10202,
  pins: [
    { role: 'BcryptService' },
    { role: 'DocCryptoService' }
  ]
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
