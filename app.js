'use strict';

const co = require('co');
const createErrorLog = require('./logger').createErrorLog;

function* appMiddleware(cryptoService, bcryptService) {
  const encrypt = yield cryptoService.encrypt({type: 'doca', doc: {enc1: 'AAAA', enc2: 'BBBB', field1: 'XXXX'}});
  //console.log('Encrypt', encrypt);//XXX
  //const decrypt = yield cryptoService.decrypt({type: 'doca', doc: encrypt.doc});
  //console.log('Decrypt', decrypt);//XXX

  console.log('===========================================================');//XXX
  const hash = yield bcryptService.bcryptHash({value: 'TEST', requestId: 'REQ_ID'});
  console.log('===========================================================');//XXX

  //console.log('bcryptHash', hash);//XXX
  //const check = yield bcryptService.bcryptCheck({value: 'TEST', hash: hash.hash});
  //console.log('bcryptCheck', check);//XXX
  return 'ALL DONE';
}

module.exports = function(dic) {
  co(function*() {
    return yield appMiddleware(dic.docCryptoService(), dic.bcryptService());
  }).then(console.log, function(err) {
    console.log('ERROR: App catch');//XXX
    console.log(createErrorLog(err));//XXX
  });
};
