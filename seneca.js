'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');

class SenecaClient {
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

}

class SenecaUtils {
  static createPlugin(service, opts) {
    const pluginName = opts.name;
    const role = opts.role;
    if(!pluginName || !role) {
      throw new Error('Both name and role needs to be specified');
    }

    let expose = opts.expose;
    if(!expose) {
      expose = [];
      //find methods to expose
      for (let methodName in service) {
        let fn = service[methodName];
        if (!_.isFunction(fn) || _.includes(['init', 'mergeOptions'], methodName)) {
          continue;
        }
        expose.push(methodName);
      }
    }

    const actions = [];
    if(service.init) {
      actions.push({
        args: {
          init: pluginName
        },
        fn: wrapper(service, service.init)
      });
    }

    for(let method of expose) {
      actions.push({
        args: {
          role: role,
          cmd: method
        },
        fn: wrapper(service, service[method])
      });
    }

    return function(options) {
      const seneca = this;

      if(service.mergeOptions) {
        service.mergeOptions(options);
      }

      for(let action of actions) {
        seneca.add(action.args, action.fn);
      }

      return {
        name: pluginName
      }
    };

    function wrapper(thisArg, fn) {
      return function(args, done) {
        bluebird.try(_.bind(fn, thisArg, args)).asCallback(done);
      }
    }
  }
}

module.exports = {
  SenecaClient,
  SenecaUtils
};
