'use strict';

const DataStore = require('../libs/datastore');
const Artists = new DataStore('Artists');
const Arts = new DataStore('Arts');
const Pointers = new DataStore('Pointers');

module.exports.list = async () => {
  return await Pointers.find({itemsField: 'pointers'});
};

module.exports.getPointer = async (pointerId) => {

  return await Pointers.findById(pointerId);
};

module.exports.create = async (invitation_code, art_id, pointer) => {

  const artist = await Artists.findOneBy('invitation_code', invitation_code);
  if (artist == null) {
    return Promise.reject('invalid invitation code');
  }

  const art = await Arts.findById(art_id);
  if (art == null) {
    return Promise.reject('invalid art id');
  }

  pointer.artist_id = artist.id;
  pointer.art_id = art_id;
  return Pointers.create(pointer);
};

module.exports.approve = async (pointerId, approve) => {

  const pointer = await Pointers.findById(pointerId);
  if (!pointer) {
    return Promise.reject('pointer not found');
  }
  var data = { status: approve ? 'approved' : 'pending' };
  await Pointers.update({ id: pointer.id, data: data });
};
