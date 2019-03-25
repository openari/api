'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
const ApplicationTokens = require('../../../models/applicationTokens');

const applicationParamsSchema = Joi.object({
  applicationId: Joi.number().required()
});

const applicationTokenInvalidateParamsSchema = Joi.object({
  applicationId: Joi.number().required(),
  tokenId: Joi.number().required()
});

module.exports.list = {
  description: 'List All Tokens of An Application',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: applicationParamsSchema
  },
  handler: async function(request, h){

    let applicationId = request.params.applicationId;
    let finding = await ApplicationTokens.list(applicationId);

    finding.tokens = finding.tokens.map(Transformers.applicationTokenProfile);

    return h.response(finding);
  }
};

module.exports.create = {
  description: 'Get An Application',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: applicationParamsSchema
  },
  handler: async function(request, h){

    let applicationId = request.params.applicationId;
    let token = await ApplicationTokens.create(applicationId);

    token = Transformers.applicationTokenProfile(token);

    return h.response(token);
  }
};

module.exports.invalidate = {
  description: 'Invalidate An Application Token',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: applicationTokenInvalidateParamsSchema,
  },
  handler: async function(request, h){

    try {
      const tokenId = request.params.tokenId;
      await ApplicationTokens.invalidate(tokenId);

      const response = {};
      response.msg = 'The application token is successfully invalidated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'token not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
