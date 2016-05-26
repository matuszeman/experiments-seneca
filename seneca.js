'use strict';

const _ = require('lodash');

module.exports = class SenecaClient {
  constructor(seneca) {
    this.seneca = seneca;
  }

  act(role, cmd, args) {
    return new Promise((resolve, reject) => {
      args = _.defaults({
        role: role,
        cmd: cmd
      }, args);
      this.seneca.act(args, (err, ret) => {
        if(err) {
          return reject(err);
        }
        resolve(ret);
      });
    });
  }
};

return;

seneca.registerService = function(service) {
  const seneca = this;
  const pluginName = service.name;
  if(!pluginName) {
    throw new Error('No service/plugin name');
  }

  const cmds = [];
  _.forOwn(service, (func, prop) => {
    switch (prop) {
      case 'init':
        cmds.push({
          args: {
            init: pluginName
          }
        });
        break;
    }
  });

  seneca.use(function(options) {



    return {
      name: pluginName
    }
  });
};
