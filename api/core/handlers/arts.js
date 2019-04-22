'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
const Arts = require('../../../models/arts');
const ArtRevisions = require('../../../models/artRevisions');

const createBodySchema = Joi.object({
  invitation_code: Joi.string().required(),
  identification: Joi.object({
    applicant: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    type_of_object: Joi.string().required(),
    materials: Joi.string().allow(''),
    techniques: Joi.string().allow(''),
    measurements: Joi.string().allow(''),
    inscriptions_and_markings: Joi.string().allow(''),
    distinguishing_features: Joi.string().allow(''),
    title: Joi.string().required(),
    subject: Joi.string().required(),
    date_or_period: Joi.string().allow(''),
    maker: Joi.string().required(),
    brief: Joi.string().required(),
    attachments: Joi.array().items(Joi.object({
      url: Joi.string().uri().required(),
      hash: Joi.string().required()
    })),
    image: Joi.string().uri().required()
  }),
  ownership: Joi.object({
    owner: Joi.string().allow(''),
    owner_public: Joi.boolean().required(),
    email: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    contact_public: Joi.boolean().required(),
    price: Joi.string().allow(''),
    price_public: Joi.boolean().required(),
  })
});

const artParamsSchema = Joi.object({
  artId: Joi.number().required()
});

module.exports.create = {
  description: 'Register an art',
  auth: {
    strategy: 'jwt'
  },
  validate: {
    payload: createBodySchema,
    failAction: async (request, h, err) => {
      if (err.isJoi) {
        // do something with error
        console.log(err.message);
      }

      throw err;
    }
  },
  handler: async function(request, h){

    try {
      const invitation_code = request.payload.invitation_code;
      const identification = request.payload.identification;
      const ownership = request.payload.ownership;

      await Arts.create(invitation_code, identification, ownership);

      return h.response({
        "message": "Thank you! We will email you ARI detail after approval."
      }).code(201);

    } catch (e) {
      if (e == 'invalid invitation code') {
        return h.response({ error: 'Invitation code invalid.'}).code(401);
      }
      throw e;
    }
  }
};

module.exports.list = {
  description: 'Query for an art',
  cors: true,
  auth: {
    strategy: 'jwt'
  },
  handler: async function(request, h){
    let list = await Arts.publicList();
    list.arts = list.arts.map(Transformers.artProfile);
    return h.response(list);
  }
};

module.exports.getData = {
  description: 'Query for an art',
  cors: true,
  auth: {
    strategy: 'jwt'
  },
  validate: {
    params: artParamsSchema
  },
  handler: async function(request, h){

    let artId = request.params.artId;

    try {

      let art = await Arts.getArtLatestAll(artId);
      art = Transformers.artProfile(art);
      return h.response(art);

    } catch (e) {
      if (e == 'art not found') {
        return h.response({ error: 'Art not found.'}).code(404);
      }
      throw e;
    }
  }
};

module.exports.update = {
  description: 'Update an art',
  auth: {
    strategy: 'jwt'
  },
  validate: {
    params: artParamsSchema,
    payload: createBodySchema
  },
  handler: async function(request, h){

    try {
      const artId = request.params.artId;
      const invitation_code = request.payload.invitation_code;
      const identification = request.payload.identification;
      const ownership = request.payload.ownership;

      await ArtRevisions.create(invitation_code, artId, identification, ownership);

      return h.response({
        "message": "Thank you! We will email you ARI detail after approval."
      }).code(201);

    } catch (e) {
      if (e == 'invalid invitation code') {
        return h.response({ error: 'Invitation code invalid.'}).code(401);
      }
      if (e == 'invalid art id') {
        return h.response({ error: 'Art not found.'}).code(401);
      }
      throw e;
    }
  }
};
