const CryptoJS = require('crypto-js');

class CryptoService {

  encrypt(text) {
    var ciphertext = CryptoJS.AES.encrypt(text, process.env.BLOCKCHAIN_GATEWAY_KEY);
    return ciphertext.toString();
  }

  decrypt(ciphertext) {
    var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.BLOCKCHAIN_GATEWAY_SECRET);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8)
    return plaintext;
  }

}

module.exports = new CryptoService();
