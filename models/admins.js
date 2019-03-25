'use strict';

const bcrypt = require('bcrypt');

const DataStore = require('../libs/datastore');
const Admins = new DataStore('Admins');

module.exports.list = async () => {
  return await Admins.find({itemsField: 'admins'});
};

module.exports.getAllAdminEmails = async () => {
  const result = await Admins.find({itemsField: 'admins'});

  return await result.admins
    .filter(admin => !admin.disabled)
    .map(admin => admin.email);
};

module.exports.getAdmin = async (adminId) => {

  return await Admins.findById(adminId);
};

module.exports.create = async (name, email, password) => {

  const found = await Admins.findOneBy('email', email);

  if (found) {
    return Promise.reject('email conflict');
  }

  password = await bcrypt.hash(password, 6);

  let data = {
    email,
    name,
    password
  };

  return Admins.create(data);
};

module.exports.login = async (email, password) => {

  const admin = await Admins.findOneBy('email', email);
  if (admin == null) {
    return Promise.reject('admin not found');
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);
  if (!passwordMatch) {
    return Promise.reject('password mismatch');
  }
  if (admin.disabled) {
    return Promise.reject('admin disabled');
  }

  return Promise.resolve(admin);
};

module.exports.statusCheck = async (adminId) => {

  const admin = await Admins.findById(adminId);
  if (!admin) {
    return Promise.reject('admin not found');
  }
  if (admin.disabled) {
    return Promise.reject('admin disabled');
  }

  return Promise.resolve(true);
};

module.exports.forgetPassword = async (email) => {
  return new Promise(async (resolve, reject) => {

    const admin = await Admins.findOneBy('email', email);
    if (admin == null) {
      return reject('admin not found');
    }
    var newPassword = Math.floor(Math.random()*90000000) + 10000000;
    var password = await bcrypt.hash(newPassword.toString(), 6);
    await Admins.update({ id: admin.id, data: { password: password }});

    return resolve(newPassword);
  });
};

module.exports.changePassword = async (adminId, password) => {

  const admin = await Admins.findById(adminId);
  if (!admin) {
    return Promise.reject('admin not found');
  }
  password = await bcrypt.hash(password, 6);
  await Admins.update({ id: admin.id, data: { password: password }});
};

module.exports.updateStatus = async (adminId, disabled) => {

  const admin = await Admins.findById(adminId);
  if (!admin) {
    return Promise.reject('admin not found');
  }
  await Admins.update({ id: admin.id, data: { disabled: disabled }});
};
