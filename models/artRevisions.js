'use strict';

const assert = require('assert').strict;

const DataStore = require('../libs/datastore');
const Artists = new DataStore('Artists');
const Arts = new DataStore('Arts');
const ArtRevisions = new DataStore('ArtRevisions');
const ArtIdentifications = new DataStore('ArtIdentifications');
const ArtOwnerships = new DataStore('ArtOwnerships');

module.exports.list = async () => {
  return await ArtRevisions.find({itemsField: 'art_revisions'});
};

module.exports.getArtRevision = async (artRevisionId) => {

  let artRevision = await ArtRevisions.findById(artRevisionId);
  artRevision.identification = await ArtIdentifications.findOneBy('revision_id', artRevision.id);
  artRevision.ownership = await ArtOwnerships.findOneBy('revision_id', artRevision.id);
  return artRevision;
};

module.exports.create = async (invitation_code, art_id, identification, ownership) => {

  const artist = await Artists.findOneBy('invitation_code', invitation_code);
  if (artist == null) {
    return Promise.reject('invalid invitation code');
  }

  const art = await Arts.findById(art_id);
  if (art == null) {
    return Promise.reject('invalid art id');
  }

  let data = { artist_id: artist.id, art_id: art_id, status: 'pending' };
  data.applicant = identification.applicant;
  data.email = identification.email;
  data.phone = identification.phone;
  data.subject = identification.subject;
  data.title = identification.title;
  let revision = await ArtRevisions.create(data);

  identification.type = 'revision';
  identification.revision_id = revision.id;
  await ArtIdentifications.create(identification);
  ownership.type = 'revision';
  ownership.revision_id = revision.id;
  await ArtOwnerships.create(ownership);

  return art;
};

module.exports.approve = async (artRevisionId, approve) => {

  const artRevision = await ArtRevisions.findById(artRevisionId);
  if (!artRevision) {
    return Promise.reject('revision not found');
  }

  const art = await Arts.findById(artRevision.art_id);
  assert(art != null, `art ${artRevision.art_id} not found`);

  var data = { status: approve ? 'approved' : 'pending' };
  await ArtRevisions.update({ id: artRevision.id, data: data });

  if (approve) {
    data = {
      revision_id: artRevision.id,
      applicant: artRevision.applicant,
      email: artRevision.email,
      phone: artRevision.phone,
      subject: artRevision.subject,
      title: artRevision.title
    };
    Arts.update({ id: art.id, data: data });
  }
};
