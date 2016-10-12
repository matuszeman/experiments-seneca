module.exports = function testMiddleware(bcryptService) {
  return function*() {
    this.body = {
      ret: true
    };
  };
};
module.exports.$injects = ['bcryptService'];