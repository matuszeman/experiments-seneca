const pluginName = 'test';

//default plugin options
const defaults = {
  role: 'local',
  initDelay: 1000,
  timeout: 10000
};

module.exports = function(options) {
  const seneca = this;

  console.log('Loading plugin:', this.context.full);//XXX
  console.log('User options:', options);//XXX

  //merge default plugin options with options passed seneca.use('plugin', options);
  options = seneca.util.deepextend(defaults, options);

  console.log('Options:', options);//XXX

  // initialization - all plugins must finish initialization before seneca.ready(cb) is called.
  seneca.add({init: pluginName}, function(msg, done) {
    console.log(`Waiting ${options.initDelay}ms for test plugin to init`);//XXX
    setTimeout(function() {
      console.log('... test plugin ready');//XXX
      done();
    }, options.initDelay);
  });

  seneca.add({role: options.role, cmd: 'echo'}, function(msg, done) {
    console.log('role:test,cmd:echo');//XXX
    // do not call done
    done(null, msg);
  });

  seneca.add({role: options.role, cmd: 'timeout'}, function(msg, done) {
    console.log('role:test,cmd:timout');//XXX
    setTimeout(done, options.timeout);
  });

  return {
    name: pluginName
  };
};