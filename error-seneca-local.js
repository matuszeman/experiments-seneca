const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./error-app');

const ErrorService = require('./services/error-service');

const seneca = require('seneca')({
  tag: 'myclient',
  timeout: 2000, // action timeout
  log: {
    quiet: true
  }
});
seneca.options('./plugin-options.js');

seneca.use({
  init: SenecaFactory.createPlugin(new ErrorService(), {
    expose: ['promiseOperationalError', 'promiseProgrammerError', 'generatorOperationalError', 'generatorProgrammerError']
  }),
  name: 'ErrorService'
});

seneca.ready(function() {
  const seneca = this;

  const SenecaClient = require('./seneca').SenecaClient;
  const client = new SenecaClient(seneca);

  const di = {
    errorService: function() {
      return SenecaFactory.createProxyService(
        'ErrorService',
        client
      );
    }
  };

  app(di);
});
