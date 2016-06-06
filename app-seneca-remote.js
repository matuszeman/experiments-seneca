const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./app');

const seneca = require('seneca')({
  tag: 'myclient',
  timeout: 3000 // action timeout
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
