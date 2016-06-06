'use strict';

const co = require('co');

function renderError(msg, err) {
  console.log(msg, '>>>', err.message);//XXX
  //user error - using Boom package
  if (err.isBoom) {
    console.log('User error data: ', err.data);//XXX
  }
  //console.log(err);//XXX
}

function* errorMiddleware(errorService) {
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

  try {
    yield errorService.generatorArgValidationError();
  } catch(err) {
    renderError('CATCHED generatorArgValidationError', err);//XXX
  }

  try {
    yield errorService.promiseArgValidationError();
  } catch(err) {
    renderError('CATCHED promiseArgValidationError', err);//XXX
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
    renderError('XXX CATCHED promiseOperationalError', err);//XXX
  }

  try {
    proms.push(errorService.promiseProgrammerError().catch((err) => {
      renderError('PROMISE CATCH promiseProgrammerError', err);//XXX
    }));
  } catch(err) {
    renderError('XXX CATCHED promiseProgrammerError', err);//XXX
  }

  try {
    proms.push(errorService.promiseArgValidationError().catch((err) => {
      renderError('PROMISE CATCH promiseArgValidationError', err);//XXX
    }));
  } catch(err) {
    renderError('XXX CATCHED promiseArgValidationError', err);//XXX
  }

  yield proms;
}

module.exports = function(dic) {
  co(function*() {
    return yield errorMiddleware(dic.errorService());
  }).then(() => {
    console.log('APPLICATION SUCCESS');//XXX
  }, (err) => {
    console.error('APPLICATION ERROR');//XXX
    console.error(err);//XXX
  });
};