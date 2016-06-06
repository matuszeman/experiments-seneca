'use strict';

const co = require('co');

function renderError(msg, err) {
  console.log(msg);//XXX
  //console.log(err);//XXX
}

function* runApp(dic) {
  const errorService = dic.errorService();

  console.log('----------------------------------');//XXX
  console.log('    RUN AS GENERATOR');//XXX
  console.log('----------------------------------');//XXX
  try {
    yield errorService.promiseOperationalError();
  } catch(err) {
    renderError('CATCHED promiseOperationalError', err);//XXX
  }

  try {
    yield errorService.promiseProgrammerError();
  } catch(err) {
    renderError('CATCHED promiseProgrammerError', err);//XXX
  }

  try {
    yield errorService.generatorOperationalError();
  } catch(err) {
    renderError('CATCHED generatorOperationalError', err);//XXX
  }

  try {
    yield errorService.generatorProgrammerError();
  } catch(err) {
    renderError('CATCHED generatorProgrammerError', err);//XXX
  }


  console.log('----------------------------------');//XXX
  console.log('    RUN AS PROMISE');//XXX
  console.log('----------------------------------');//XXX
  const proms = [];
  try {
    proms.push(errorService.promiseOperationalError().catch((err) => {
      renderError('PROMISE CATCH promiseOperationalError', err);//XXX
    }));
  } catch(err) {
    renderError('CATCHED promiseOperationalError', err);//XXX
  }

  try {
    proms.push(errorService.promiseProgrammerError().catch((err) => {
      renderError('PROMISE CATCH promiseProgrammerError', err);//XXX
    }));
  } catch(err) {
    renderError('CATCHED promiseProgrammerError', err);//XXX
  }

  yield proms;
}

module.exports = function(dic) {
  co(function*() {
    return yield runApp(dic);
  }).then(() => {
    console.log('APPLICATION SUCCESS');//XXX
  }, (err) => {
    console.error('APPLICATION ERROR');//XXX
    console.error(err);//XXX
  });
};