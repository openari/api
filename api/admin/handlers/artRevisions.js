'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
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
      await ArtRevisions.approve(artRevisionId, approve);

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
