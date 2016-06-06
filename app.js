'use strict';

const co = require('co');

function* runApp(dic) {
  const cryptoService = dic.docCryptoService();
  const bcryptService = dic.bcryptService();

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
    return yield runApp(dic);
  }).then(console.log, console.error);
};