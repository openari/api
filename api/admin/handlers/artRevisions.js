'use strict';

require('dotenv').config();

const Joi = require('joi');
const rp = require('request-promise-native');

const CryptoService = require('../../../libs/cryptoService');
const Transformers = require('../helpers/transformers');
const Arts = require('../../../models/arts');
const ArtRevisions = require('../../../models/artRevisions');

const artRevisionParamsSchema = Joi.object({
  artRevisionId: Joi.number().required()
});

const approveArtRevisionBodySchema = Joi.object({
  approve: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Art Revisions',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await ArtRevisions.list();

    finding.art_revisions = finding.art_revisions.map(Transformers.artRevisionProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
  description: 'Get An Art Revision',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artRevisionParamsSchema
  },
  handler: async function(request, h){

    let artRevisionId = request.params.artRevisionId;
    let artRevision = await ArtRevisions.getArtRevision(artRevisionId);

    artRevision = Transformers.artRevisionProfile(artRevision);

    return h.response(artRevision);
  }
};

module.exports.approve = {
  description: 'Approve An Art Revision',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artRevisionParamsSchema,
    payload: approveArtRevisionBodySchema
  },
  handler: async function(request, h){

    try {
      const artRevisionId = request.params.artRevisionId;
      const approve = request.payload.approve;
      const revision = await ArtRevisions.approve(artRevisionId, approve);

      const art = await Arts.getArtLatest(revision.art_id);

      // remove data that is not public before sending them to blockchain
      if (art.ownership.price_public !== true) {
        art.ownership.price = 'N/A';
      }
      if (art.ownership.contact_public !== true) {
        art.ownership.email = 'N/A';
        art.ownership.phone = 'N/A';
      }
      if (art.ownership.owner_public !== true) {
        art.ownership.owner = 'N/A';
      }

      const gatewayUrl = process.env.BLOCKCHAIN_GATEWAY;
      const json = JSON.stringify(art);
      const payloadPlain = process.env.BLOCKCHAIN_GATEWAY_SECRET_SALT + json;
      let payload = CryptoService.encrypt(payloadPlain);

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

      await Arts.bindToBlockchain(revision.art_id, result.txhash);

      const response = {};
      response.msg = 'The art revision status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'revision not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
