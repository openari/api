'use strict';

require('dotenv').config();
const Joi = require('joi');
const uuidv1 = require('uuid/v1');

const storage = require('../../../libs/storage');
const SHA3WriteStream = require('../../../libs/sha3WriteStream');

const bucketnameAttachments = process.env.BUCKET_ATTACHMENTS;


// Custom Joi
var stream = Joi.object({
  pipe: Joi.func().required()
}).unknown();

module.exports.upload = {
  description: 'Upload an attachment',
  auth: {
    strategy: 'jwt'
  },
  validate: {
    payload: {
      attachment: stream
    }
  },
  payload: {
    output: 'stream',
    allow: 'multipart/form-data',
    // allow 100 MB
    maxBytes: 104857600,
    parse: true
  },
  handler: async function(request, h){

    let bucketname = bucketnameAttachments;

    let fileStream = request.payload.attachment;
    let file = request.payload.attachment.hapi;

    if(!file){
      return h.response({err: 'The file does not existed.'}).code(400);
    }

    let id = uuidv1();
    let gcsname = id + '_' + file.filename;

    let shaWriteStream = new SHA3WriteStream();

    fileStream.pipe(shaWriteStream);
    const isSuccess =
      await storage.upload(
        bucketname, fileStream, file.headers['content-type'], gcsname);

    if (!isSuccess) {
      return h.response({err: 'Error uploading file'}).code(500);
    }

    const url = await storage.make_public(gcsname, bucketname);

    if (!url) {
      return h.response({err: 'Error uploading file'}).code(500);
    }

    let result = {
      url: url,
      hash: shaWriteStream.hash()
    };

    return h.response(result).code(201);
  }
};


