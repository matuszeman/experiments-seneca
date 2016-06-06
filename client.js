'use strict';

const _ = require('lodash');

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
//const plugin = myseneca.SenecaUtils.createPlugin(require('./services/test-obj'), {name: 'test', role: 'local'});
//const plugin = myseneca.SenecaUtils.createPlugin(new (require('./services/test-class'))(), {
//  name: 'test', role: 'local', expose: ['echo', 'timeout']
//});


const SenecaFactory = require('./seneca').SenecaFactory;

const CryptoService = require('./services/crypto-service');
const Encryptor = require('./services/encryptor');
const DocCryptoService = require('./services/doc-crypto-service');
const BcryptService = require('./services/bcrypt-service');
const CryptoProxy = require('./services/crypto-proxy');

// Option 1 - implement one service only
const cryptoPlugin = SenecaFactory.createPlugin(new CryptoService(new Encryptor()), {
  role: 'crypto',
  expose: ['encrypt', 'decrypt', 'bcryptHash', 'bcryptCheck']
});

// Option 2 - implement multiple services and expose them under the same role namespace 'crypto'
const docCryptoPlugin = SenecaFactory.createPlugin(new DocCryptoService(new Encryptor()), {
  name: 'doc-crypto',
  role: 'crypto', // exposes these service methods under same 'crypto' role
  expose: ['encrypt', 'decrypt']
});

const bcryptPlugin = SenecaFactory.createPlugin(new BcryptService(), {
  role: 'crypto', // exposes these service methods under same 'crypto' role
  expose: ['bcryptHash', 'bcryptCheck']
});

// Option 3 - implement one service which acts as proxy to other services
const cryptoProxy = new CryptoProxy(
  new DocCryptoService(new Encryptor()),
  new BcryptService()
);
const cryptoProxyPlugin = SenecaFactory.createPlugin(cryptoProxy, {
  role: 'crypto',
  expose: ['encrypt', 'decrypt', 'bcryptHash', 'bcryptCheck']
});

// Option 1
seneca.use({init: cryptoPlugin, name: 'crypto'});

// Option 2
//seneca.use({init: docCryptoPlugin, name: 'crypto'});
//seneca.use({init: bcryptPlugin, name: 'crypto'});

// Option 3
//seneca.use({init: cryptoProxyPlugin, name: 'crypto'});

const onReady = runProxy;

//run once
seneca.ready(onReady);

//const proxy = SenecaFactory.createProxyClient('crypto');
//console.log(proxy.encrypt('XX'));//XXX

//runs every 5s
//seneca.ready(function() {
//  onReady.call(this);
//  setInterval(onReady.bind(this), 5000);
//});

function runSeneca(err) {
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
  const SenecaClient = require('./seneca').SenecaClient;
  const client = new SenecaClient(this);

  //NSQ
  //client.act('amqp', 'echo').then(console.log).catch(console.error);

  //HTTP
  //client.act('http', 'echo').then(console.log).catch(console.error);

  //TCP
  //client.act('tcp', 'echo').then(console.log).catch(console.error);

  //Local
  //client.act('local', 'echo').then(console.log).catch(console.error);
  client.act('crypto', 'encrypt', {type: 'doca', doc: {enc1: 'AAAA', enc2: 'BBBB', field1: 'XXXX'}}).then((ret) => {
    return client.act('crypto', 'decrypt', {type: 'doca', doc: ret.doc});
  }).then((ret) => {
    console.log('encrypt/decrypt return: ', ret);//XXX
    return client.act('crypto', 'bcryptHash', {value: 'TEST'})
  }).then((ret) => {
    console.log('bcryptHash', ret);//XXX
  }).catch(console.error);

  //Local - timeout
  //client.act('local', 'timeout').then(console.log).catch(console.error);
}

function runProxy() {
  const SenecaClient = require('./seneca').SenecaClient;
  const client = new SenecaClient(this);
  const serviceProxy = SenecaFactory.createProxyService('crypto', client);

  runServiceCalls(serviceProxy);
}

function runServiceCalls(service) {
  service.encrypt({type: 'doca', doc: {enc1: 'AAAA', enc2: 'BBBB', field1: 'XXXX'}}).then((ret) => {
    return client.decrypt({type: 'doca', doc: ret.doc});
  }).then((ret) => {
    console.log('encrypt/decrypt return: ', ret);//XXX
    return client.bcryptHash({value: 'TEST'})
  }).then((ret) => {
    console.log('bcryptHash', ret);//XXX
  }).catch(console.error);
}