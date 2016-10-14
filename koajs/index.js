const co = require('co');
const koa = require('koa');

const registry = {};
function* registerClass(classDef, opts) {
  if(classDef.$injects) {
    console.log('INJECT', classDef.$injects);//XXX
  }

  const ins = new classDef();
  const serviceName = opts.name || classDef.constructor.name;
  registry[serviceName] = ins;
}

const testFactory = require('./route/test');
co(function*() {
  yield registerClass(registry, require('../services/bcrypt-service'));
}).then(() => {
  initApp(registry)
});

function* initApp(di) {
  const app = koa();
  const router = require('koa-router')();

  //router.get('/test', );

  app.context.services = di;
  app
    .use(function*() {

      //console.log(this.di);//XXX
    })
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(3000);
}