'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports.newToken = (adminData) => {

  var token = jwt.sign(
    { adminId: adminData.id },
    process.env.JWTTOKEN_SECRET,
    { expiresIn: process.env.JWTTOKEN_EXPIRES_IN }
  );

  adminData.token = token;
  adminData.type = 'Bearer';
  adminData.expiresIn = process.env.JWTTOKEN_EXPIRES_IN;

  return adminData;
};
