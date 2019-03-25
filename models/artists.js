'use strict';

const helper = require('./helper/helper');
const DataStore = require('../libs/datastore');
const Artists = new DataStore('Artists');

module.exports.list = async () => {
  return await Artists.find({itemsField: 'artists'});
};

module.exports.getArtist = async (artistId) => {

  return await Artists.findById(artistId);
};

module.exports.create = async (name, phone, email, url, source, description) => {

  const found = await Artists.findOneBy('email', email);

  if (found) {
    return Promise.reject('email conflict');
  }

  let data = { name, phone, email, url, source, description };

  data.status = 'pending';

  return Artists.create(data);
};

module.exports.approve = async (artistId, approve) => {

  const artist = await Artists.findById(artistId);
  if (!artist) {
    return Promise.reject('artist not found');
  }
  var data = { status : approve ? 'approved' : 'pending' };
  if (approve && !artist.invitation_code) {
    let code = await helper.generateInvitationCode(async (code) => {
      const found = await Artists.findOneBy('invitation_code', code);
      return (found != null);
    });
    data.invitation_code = code;
  }
  await Artists.update({ id: artist.id, data: data });
};
