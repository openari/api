'use strict';

require('dotenv').config();

const Joi = require('joi');

const Transformers = require('../helpers/transformers');
const Helper = require('../helpers/helper');
const Admins = require('../../../models/admins');

const createAdminBodySchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  password: Joi.string().required()
});

const adminParamsSchema = Joi.object({
  adminId: Joi.number().required()
});

const updateAdminStatusBodySchema = Joi.object({
  disabled: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Admins',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await Admins.list();

    finding.admins = finding.admins.map(Transformers.adminProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
  description: 'Get An Admin',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: adminParamsSchema
  },
  handler: async function(request, h){

    let adminId = request.params.adminId;
    let admin = await Admins.getAdmin(adminId);

    admin = Transformers.adminProfile(admin);

    return h.response(admin);
  }
};

module.exports.create = {
  description: 'Create Admin',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    payload: createAdminBodySchema
  },
  handler: async function(request, h){

    const email = request.payload.email;
    const name = request.payload.name;
    const password = request.payload.password;

    try {

      let newAdmin = await Admins.create(name, email, password);

      const transformed = Transformers.adminProfile(newAdmin);
      const response = Helper.newToken(transformed);
      response.msg = 'Welcome our new admin user!';

      return h.response(response).code(201);
    } catch(e) {
      if (e == 'email conflict') {
        return h.response({ err: 'This email already exists.'}).code(409);
      } else {
        console.log('signup exception', e);
        throw(e);
      }
    }
  }
};

module.exports.updateStatus = {
  description: 'Update Admin Status',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: adminParamsSchema,
    payload: updateAdminStatusBodySchema
  },
  handler: async function(request, h){

    try {
      const adminId = request.params.adminId;
      const disabled = request.payload.disabled;
      await Admins.updateStatus(adminId, disabled);

      const response = {};
      response.msg = 'The admin status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'admin not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
