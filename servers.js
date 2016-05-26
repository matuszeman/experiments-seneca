'use strict';

const servers = {
  amqp: true,
  http: true,
  tcp: true
};

if(servers.amqp) {
  //https://github.com/seneca-contrib/seneca-amqp-transport
  let seneca = require('seneca')();
  seneca.options('./plugin-options.js');

  seneca.use('seneca-amqp-transport');
  seneca.use({init: require('./plugins/test'), name: 'test'}, {role: 'amqp'});

  seneca.ready(function() {
    seneca.listen({
      type: 'amqp',
      pin: 'role:amqp' //https://github.com/seneca-contrib/seneca-amqp-transport#how-it-works
    });
  });
}

if(servers.http) {
  let seneca = require('seneca')();
  seneca.options('./plugin-options.js');

  seneca.use({init: require('./plugins/test'), name: 'test'}, {role: 'http'});

  seneca.ready(function() {
    seneca.listen({
      //type: 'http',
      port: 10201
    });
  })
}

if(servers.tcp) {
  let seneca = require('seneca')();
  seneca.options('./plugin-options.js');

  seneca.use({init: require('./plugins/test'), name: 'test'}, {role: 'tcp'});

  seneca.ready(function() {
    seneca.listen({
      type: 'tcp',
      port: 10202
    });
  })
}