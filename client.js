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
seneca.use({init: require('./plugins/test'), name: 'test'});
//seneca.use({init: require('./plugins/test'), name: 'test', tag:'mytag'});

//run once
seneca.ready(runClient);

//runs every 5s
//seneca.ready(function() {
//  runClient.call(this);
//  setInterval(runClient.bind(this), 5000);
//});

function runClient() {
  const seneca = this;

  //NSQ
  seneca.act({
    role: 'amqp', cmd: 'echo'
  }, console.log);

  //HTTP
  seneca.act({
    role: 'http', cmd: 'echo'
  }, console.log);

  //TCP
  seneca.act({
    role: 'tcp', cmd: 'echo'
  }, console.log);

  //Local
  seneca.act({
    role: 'local', cmd: 'echo'
  }, console.log);

  //Local - timeout
  //seneca.act({
  //  role: 'local', cmd: 'timeout'
  //}, console.log);
}