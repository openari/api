'use strict';

require('dotenv').config();

const Joi = require('joi');

const mailSender = require('../../../config/mailer').mailSender;
const Transformers = require('../helpers/transformers');
const Helper = require('../helpers/helper');
const Admins = require('../../../models/admins');

const authAdminBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgetPasswordAdminBodySchema = Joi.object({
  email: Joi.string().email().required()
});

const changePasswordAdminBodySchema = Joi.object({
  password: Joi.string().required()
});

module.exports.login = {
  description: 'Admin Login',
  cors: true,
  validate: {
    payload: authAdminBodySchema
  },
  handler: async function(request, h){

    const email = request.payload.email;
    const password = request.payload.password;

    try {
      let admin = await Admins.login(email, password);
      const transformed = Transformers.adminProfile(admin);
      const response = Helper.newToken(transformed);
      response.msg = 'Welcome back! We miss you so much.';

      return h.response(response).code(201);
    } catch (e) {
      if (e == 'admin not found'
          || e == 'password mismatch'
          || e == 'admin disabled') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};

module.exports.forgetPassword = {
  description: 'Admin Forget Password',
  cors: true,
  validate: {
    payload: forgetPasswordAdminBodySchema
  },
  handler: async function(request, h){

    const email = request.payload.email;

    try {
      let newPassword = await Admins.forgetPassword(email);


      var mail = {
        to: email,
        subject: "Your admin password is reset.",
        text: `This is your new password: ${newPassword}`,
        html: `<b>This is your new password: ${newPassword}</b>`,
      };
      await mailSender.sendMail(mail);

      const response = {};
      response.msg = 'We got you covered! The new password is delivered to your email box.';

      return h.response(response).code(201);
    } catch (e) {
      if (e == 'admin not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};

module.exports.changePassword = {
  description: 'Chagne My Password',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    payload: changePasswordAdminBodySchema
  },
  handler: async function(request, h){

    try {
      const adminId = request.authAdmin.adminId;
      const password = request.payload.password;
      await Admins.changePassword(adminId, password);

      const response = {};
      response.msg = 'Your password is successfully changed.';

      return h.response().code(201);
    } catch (e) {
      if (e == 'admin not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
