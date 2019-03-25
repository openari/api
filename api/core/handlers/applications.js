'use strict';

require('dotenv').config();

const Joi = require('joi');

const Applications = require('../../../models/applications');

const createBodySchema = Joi.object({
  applicant: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email(),
  url: Joi.string().uri().allow(''),
  source: Joi.string().allow(''),
  description: Joi.string().allow('')
});

module.exports.create = {
  description: 'Register an application (apply for access)',
  validate: {
    payload: createBodySchema
  },
  handler: async function(request, h){

    try {
      const applicant = request.payload.applicant;
      const phone = request.payload.phone;
      const email = request.payload.email;
      const url = request.payload.url;
      const source = request.payload.source;
      const description = request.payload.description;

      await Applications.create(applicant, phone, email, url, source, description);

      return h.response({
        "message": "Thank you! We will email you API access detail after approval."
      }).code(201);

    } catch (e) {
      throw e;
    }
  }
};
