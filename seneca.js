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

seneca.registerService(require('./services/events'));

