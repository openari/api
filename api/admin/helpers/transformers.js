'use strict';

module.exports.adminProfile = (admin) => {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    disabled: !!admin.disabled
  };
};

module.exports.artistProfile = (artist) => {
  return {
    id: artist.id,
    name: artist.name,
    phone: artist.phone,
    email: artist.email,
    url: artist.url,
    source: artist.source,
    description: artist.description,
    status: artist.status,
    invitation_code: artist.invitation_code
  };
};

module.exports.artProfile = (art) => {
  return {
    id: art.id,
    applicant: art.applicant,
    email: art.email,
    phone: art.phone,
    title: art.title,
    subject: art.subject,
    revision_id: art.revision_id,
    identification: art.identification,
    ownership: art.ownership,
    status: art.status
  };
};

module.exports.artRevisionProfile = (artRevision) => {
  return {
    id: artRevision.id,
    art_id: artRevision.art_id,
    applicant: artRevision.applicant,
    email: artRevision.email,
    phone: artRevision.phone,
    title: artRevision.title,
    subject: artRevision.subject,
    revision_id: artRevision.revision_id,
    identification: artRevision.identification,
    ownership: artRevision.ownership,
    status: artRevision.status
  };
};

module.exports.pointerProfile = (pointer) => {
  return {
    id: pointer.id,
    art_id: pointer.art_id,
    applicant: pointer.applicant,
    email: pointer.email,
    phone: pointer.phone,
    title: pointer.title,
    pointer_url: pointer.pointer_url,
    abstract: pointer.abstract,
    status: pointer.status
  };
};

module.exports.applicationProfile = (application) => {
  return {
    id: application.id,
    applicant: application.applicant,
    phone: application.phone,
    email: application.email,
    url: application.url,
    source: application.source,
    description: application.description,
    status: application.status
  };
};

module.exports.applicationTokenProfile = (applicationToken) => {
  return {
    id: applicationToken.id,
    application_id: applicationToken.application_id,
    token: applicationToken.token,
    status: applicationToken.status
  };
};
