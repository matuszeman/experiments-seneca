'use strict';

const co = require('co');

function* appMiddleware(cryptoService, bcryptService) {
  const encrypt = yield cryptoService.encrypt({type: 'doca', doc: {enc1: 'AAAA', enc2: 'BBBB', field1: 'XXXX'}});
  console.log('Encrypt', encrypt);//XXX
  const decrypt = yield cryptoService.decrypt({type: 'doca', doc: encrypt.doc});
  console.log('Decrypt', decrypt);//XXX
  const hash = yield bcryptService.bcryptHash({value: 'TEST'})
  console.log('bcryptHash', hash);//XXX
  const check = yield bcryptService.bcryptCheck({value: 'TEST', hash: hash.hash});
  console.log('bcryptCheck', check);//XXX
  return 'ALL DONE';
}

module.exports = function(dic) {
  co(function*() {
    return yield appMiddleware(dic.docCryptoService(), dic.bcryptService());
  }).then(console.log, console.error);
};