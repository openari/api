'use strict';

const DataStore = require('../libs/datastore');
const Applications = new DataStore('Applications');

module.exports.list = async () => {
  return await Applications.find({itemsField: 'applications'});
};

module.exports.getApplication = async (applicationId) => {

  return await Applications.findById(applicationId);
};

module.exports.create = async (applicant, phone, email, url, source, description) => {

  let data = { applicant, phone, email, url, source, description };

  data.status = 'pending';

  return Applications.create(data);
};

module.exports.updateStatus = async (applicationId, status) => {

  const application = await Applications.findById(applicationId);
  if (!application) {
    return Promise.reject('application not found');
  }
  var data = { status };
  await Applications.update({ id: application.id, data: data });
};
