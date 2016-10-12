const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./app');

const seneca = require('seneca')({
  tag: 'app-seneca-remote',
  log: {
    level: 'all',
    map: [
      {
        level: 'debug',
        handler: function(timestamp, sender, level, cmd, client, direction, id, pins, params, arg1, arg2, type, receiver, number, ...args) {
          if (receiver !== '-' && cmd === 'act') {
            const ts = new Date(timestamp);
            console.log(`[${ts}] ${sender} -> ${receiver}: ${pins}, ${params}`);//XXX
          }
        }
      }
    ]
  },
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
