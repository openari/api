'use strict';

require('dotenv').config();
const Joi = require('joi');
const uuid = require('uuid');

const storage = require('../../../libs/storage');

const bucketnameImages = process.env.BUCKET_IMAGES;

// Custom Joi
var stream = Joi.object({
  pipe: Joi.func().required()
}).unknown();

module.exports.upload = {
  description: 'Upload an image',
  auth: {
    strategy: 'jwt'
  },
  validate: {
    payload: {
      image: stream
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

    let bucketname = bucketnameImages;

    let fileStream = request.payload.image;
    let file = request.payload.image.hapi;

    if(!file){
      return h.response({err: 'The file does not existed.'}).code(400);
    }

    let gcsname = uuid.v1() + '_' + file.filename;

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
      url: url
    };

    return h.response(result).code(201);
  }
};
