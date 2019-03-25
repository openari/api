'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
const Pointers = require('../../../models/pointers');

const pointerParamsSchema = Joi.object({
  pointerId: Joi.number().required()
});

const approvePointerBodySchema = Joi.object({
  approve: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Pointers',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await Pointers.list();

    finding.pointers = finding.pointers.map(Transformers.pointerProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
  description: 'Get A Pointer',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: pointerParamsSchema
  },
  handler: async function(request, h){

    let pointerId = request.params.pointerId;
    let pointer = await Pointers.getPointer(pointerId);

    pointer = Transformers.pointerProfile(pointer);

    return h.response(pointer);
  }
};

module.exports.approve = {
  description: 'Approve A Pointer',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: pointerParamsSchema,
    payload: approvePointerBodySchema
  },
  handler: async function(request, h){

    try {
      const pointerId = request.params.pointerId;
      const approve = request.payload.approve;
      await Pointers.approve(pointerId, approve);

      const response = {};
      response.msg = 'The artist status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'pointer not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
