'use strict';

require('dotenv').config();
const Joi = require('joi');

// Custom Joi
var stream = Joi.object({
  pipe: Joi.func().required()
}).unknown();

module.exports.upload = {
  description: 'Upload an attachment',
  validate: {
    payload: {
      attachment: stream
    }
  },
  payload: {
    output: 'stream',
    allow: 'multipart/form-data',
    // allow 10 MB
    maxBytes: 10485760,
    parse: true
  },
  handler: async function(request, h){

    let result = {
      id: 'uuid',
      hash: 'the hash value'
    };

    return h.response(result).code(201);
  }
};


