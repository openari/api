'use strict';

const DataStore = require('../libs/datastore');
const Applications = new DataStore('Applications');
const ApplicationTokens = new DataStore('ApplicationTokens');
const jwt = require('jsonwebtoken');

module.exports.list = async (applicationId) => {
  let params = {
    filter: {
      prefix: 'application_id',
      operator: '=',
      suffix: applicationId
    },
    itemsField: 'tokens'
  };
  return await ApplicationTokens.find(params);
};

module.exports.verifyApplicationToken = async (token) => {

  try {
    jwt.verify(token, process.env.JWTTOKEN_SECRET);
  } catch(err) {
    return Promise.reject('invalid token');
  }

  let applicationToken = await ApplicationTokens.findOneBy('token', token);
  if (!applicationToken) {
    return Promise.reject('token not found');
  }
  if (applicationToken.status == 'invalid') {
    return Promise.reject('token invalidated');
  }

  let application = await Applications.findById(applicationToken.application_id);
  if (application.status != 'approved') {
    return Promise.reject('application invalidated');
  }

  return applicationToken;
};

module.exports.create = async (applicationId) => {

  const application = await Applications.findById(applicationId);
  if (!application) {
    return Promise.reject('application not found');
  }

  var token = jwt.sign(
    { application_id: application.id },
    process.env.JWTTOKEN_SECRET
  );

  let data = { application_id: application.id, token: token, status: 'active' };
  return ApplicationTokens.create(data);
};

module.exports.invalidate = async (tokenId) => {

  const applicationToken = await ApplicationTokens.findById(tokenId);
  if (!applicationToken) {
    return Promise.reject('token not found');
  }
  var data = { status: 'invalid' };
  await ApplicationTokens.update({ id: applicationToken.id, data: data });
};
