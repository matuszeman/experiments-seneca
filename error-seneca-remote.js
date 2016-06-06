'use strict';

const SenecaFactory = require('./seneca').SenecaFactory;

const app = require('./error-app');

const ErrorService = require('./services/error-service');

const seneca = require('seneca')({
  tag: 'myclient',
  timeout: 2000, // action timeout
});

seneca.client({
  type: 'tcp',
  port: 10202,
  pins: [
    { role: 'ErrorService' }
  ]
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
