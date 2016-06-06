const co = require('co');

const options = require('./plugin-options');
const app = require('./error-app');

const ErrorService = require('./services/error-service');

const dic = {
  errorService: function() {
    const ins = new ErrorService();
    return ins;
  }
};

app(dic);