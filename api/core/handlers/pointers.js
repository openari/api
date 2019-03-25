'use strict';

require('dotenv').config();

const Joi = require('joi');

const Pointers = require('../../../models/pointers');

const artParamsSchema = Joi.object({
  artId: Joi.number().required()
});

const createBodySchema = Joi.object({
  invitation_code: Joi.string().required(),
  pointer: Joi.object({
    applicant: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    title: Joi.string().required(),
    pointer_url: Joi.string().uri().required(),
    abstract: Joi.string().required()
  })
});

module.exports.create = {
  description: 'Add an pointer to an art',
  validate: {
    params: artParamsSchema,
    payload: createBodySchema
  },
  handler: async function(request, h){

    try {
      const artId = request.params.artId;
      const invitation_code = request.payload.invitation_code;
      const pointer = request.payload.pointer;

      await Pointers.create(invitation_code, artId, pointer);

      return h.response({
        "message": "Thank you! We will email you updates after approval."
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
