'use strict';

require('dotenv').config();

const Joi = require('joi');

const Artists = require('../../../models/artists');

const createBodySchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  url: Joi.string().uri().allow(''),
  source: Joi.string().allow(''),
  description: Joi.string().allow('')
});

module.exports.create = {
  description: 'Register an artist (apply for invitation code)',
  validate: {
    payload: createBodySchema
  },
  handler: async function(request, h){

    try {
      const name = request.payload.name;
      const phone = request.payload.phone;
      const email = request.payload.email;
      const url = request.payload.url;
      const source = request.payload.source;
      const description = request.payload.description;

      await Artists.create(name, phone, email, url, source, description);

      return h.response({
        "message": "Thank you! We will email you invitation code after approval."
      }).code(201);

    } catch (e) {
      if (e == 'email conflict') {
        return h.response({ error: 'Email already registered.'}).code(401);
      }
      throw e;
    }
  }
};
