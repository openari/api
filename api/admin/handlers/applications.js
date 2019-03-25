'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
const Applications = require('../../../models/applications');

const applicationParamsSchema = Joi.object({
  applicationId: Joi.number().required()
});

const approveApplicationBodySchema = Joi.object({
  approve: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Applications',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await Applications.list();

    finding.applications = finding.applications.map(Transformers.applicationProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
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
    let application = await Applications.getApplication(applicationId);

    application = Transformers.applicationProfile(application);

    return h.response(application);
  }
};

module.exports.approve = {
  description: 'Approve An Application',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: applicationParamsSchema,
    payload: approveApplicationBodySchema
  },
  handler: async function(request, h){

    try {
      const applicationId = request.params.applicationId;
      const approve = request.payload.approve;
      await Applications.approve(applicationId, approve);

      const response = {};
      response.msg = 'The application status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'application not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
