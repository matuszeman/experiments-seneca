'use strict';

const _ = require('lodash');
const myseneca = require('./seneca');

const seneca = require('seneca')({
  tag: 'myclient',
  timeout: 3000 // action timeout
});
seneca.options('./plugin-options.js');
seneca.use('seneca-amqp-transport');

seneca.client({
  type: 'amqp',
  pin: {
    role: 'amqp'
  }
});
seneca.client({
  //type: 'http',
  port: 10201,
  pin: {
    role: 'http'
  }
});
seneca.client({
  type: 'tcp',
  port: 10202,
  pin: {
    role: 'tcp'
  }
});

//when using string as below to load a plugin - plugin name = 'plugins/test' thus plugin-options.js configuration won't work
//seneca.use('plugins/test');
//seneca.use({init: require('./plugins/test'), name: 'test'});
//seneca.use({init: require('./plugins/test'), name: 'test', tag:'mytag'});
const plugin = myseneca.SenecaUtils.createPlugin(require('./services/test-obj'), {name: 'test', role: 'local'});
seneca.use({init: plugin, name: 'test'});

const onReady = runClient;

//run once
seneca.ready(onReady);

//runs every 5s
//seneca.ready(function() {
//  onReady.call(this);
//  setInterval(onReady.bind(this), 5000);
//});

function runSeneca() {
  //NSQ
  //seneca.act({
  //  role: 'amqp', cmd: 'echo'
  //}, console.log);

  //HTTP
  //seneca.act({
  //  role: 'http', cmd: 'echo'
  //}, console.log);

  //TCP
  //seneca.act({
  //  role: 'tcp', cmd: 'echo'
  //}, console.log);

  //Local
  seneca.act({
    role: 'local', cmd: 'echo'
  }, console.log);

  //Local - timeout
  //seneca.act({
  //  role: 'local', cmd: 'timeout'
  //}, console.log);
}

function runClient() {
  const SenecaClient = require('./seneca');
  const client = new myseneca.SenecaClient(this);

  //NSQ
  //client.act('amqp', 'echo').then(console.log).catch(console.error);

  //HTTP
  //client.act('http', 'echo').then(console.log).catch(console.error);

  //TCP
  //client.act('tcp', 'echo').then(console.log).catch(console.error);

  //Local
  client.act('local', 'echo').then(console.log).catch(console.error);

  //Local - timeout
  //client.act('local', 'timeout').then(console.log).catch(console.error);
}