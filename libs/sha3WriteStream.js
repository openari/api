const stream = require('stream');
const { SHA3 } = require('sha3');

class SHA3WriteStream extends stream.Writable {

  constructor() {
    super();

    this.sha3 = new SHA3(256);
  }

  hash() {
    return this.sha3.digest('hex');
  }

  _write(chunk, enc, next) {
    this.sha3.update(chunk);
    next();
  }
}

module.exports = SHA3WriteStream;