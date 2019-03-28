'use strict';

const DataStore = require('../libs/datastore');
const Artists = new DataStore('Artists');
const Arts = new DataStore('Arts');
const ArtIdentifications = new DataStore('ArtIdentifications');
const ArtOwnerships = new DataStore('ArtOwnerships');

module.exports.list = async () => {
  return await Arts.find({itemsField: 'arts'});
};

module.exports.getArt = async (artId) => {

  let art = await Arts.findById(artId);
  art.identification = await ArtIdentifications.findOneBy('art_id', art.id);
  art.ownership = await ArtOwnerships.findOneBy('art_id', art.id);
  return art;
};

module.exports.getArtLatest = async (artId) => {

  let art = await Arts.findById(artId);

  if (!art) {
    return Promise.reject('art not found');
  }

  if (art.revision_id) {
    art.identification = await ArtIdentifications.findOneBy('art_id', art.revision_id);
    art.ownership = await ArtOwnerships.findOneBy('art_id', art.revision_id);
  } else {
    art.identification = await ArtIdentifications.findOneBy('art_id', art.id);
    art.ownership = await ArtOwnerships.findOneBy('art_id', art.id);
  }
  return art;
};

module.exports.create = async (invitation_code, identification, ownership) => {

  const artist = await Artists.findOneBy('invitation_code', invitation_code);

  if (artist == null) {
    return Promise.reject('invalid invitation code');
  }

  let data = { artist_id: artist.id, status: 'pending' };
  data.applicant = identification.applicant;
  data.email = identification.email;
  data.phone = identification.phone;
  data.subject = identification.subject;
  data.title = identification.title;
  let art = await Arts.create(data);

  identification.type = 'initial';
  identification.art_id = art.id;
  await ArtIdentifications.create(identification);
  ownership.type = 'initial';
  ownership.art_id = art.id;
  await ArtOwnerships.create(ownership);

  return art;
};

module.exports.approve = async (artId, approve) => {

  const art = await Arts.findById(artId);
  if (!art) {
    return Promise.reject('art not found');
  }
  var data = { status: approve ? 'approved' : 'pending' };
  await Arts.update({ id: art.id, data: data });
};
