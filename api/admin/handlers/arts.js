'use strict';

require('dotenv').config();

const Joi = require('joi');
const rp = require('request-promise-native');

const CryptoService = require('../../../libs/cryptoService');
const Transformers = require('../helpers/transformers');
const Arts = require('../../../models/arts');

const artParamsSchema = Joi.object({
  artId: Joi.number().required()
});

const approveArtBodySchema = Joi.object({
  approve: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Arts',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await Arts.list();

    finding.arts = finding.arts.map(Transformers.artProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
  description: 'Get An Art',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artParamsSchema
  },
  handler: async function(request, h){

    let artId = request.params.artId;
    let art = await Arts.getArt(artId);

    art = Transformers.artProfile(art);

    return h.response(art);
  }
};

module.exports.approve = {
  description: 'Approve An Art',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artParamsSchema,
    payload: approveArtBodySchema
  },
  handler: async function(request, h){

    try {
      const artId = request.params.artId;
      const approve = request.payload.approve;
      await Arts.approve(artId, approve);

      const art = await Arts.getArtLatest(artId);

      const gatewayUrl = process.env.BLOCKCHAIN_GATEWAY;
      let payload = CryptoService.encrypt(JSON.stringify(art));

      console.log('sending data to blockchain-gateway');
      console.log(payload);
      const result = await rp({
        url: gatewayUrl+'/ethereum/sendTransaction',
        method: 'POST',
        body: { data: payload },
        json: true
      });
      console.log('Received data from blockchain-gateway');
      console.log(result);

      await Arts.bindToBlockchain(artId, result.txhash);

      const response = {};
      response.msg = 'The art status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'art not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
