const pjson = require('../../../package.json');

module.exports.hello = {
  handler: function (request, h) { // eslint-disable-line no-unused-vars
    var msg = 'OpenARI API server (v.' + pjson.version + ') is up and running.';
    return { msg: msg };
  }
};
