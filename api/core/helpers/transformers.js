'use strict';

module.exports.artistProfile = (artist) => {
  return {
    name: artist.name,
    phone: artist.phone,
    email: artist.email,
    url: artist.url,
    source: artist.source,
    description: artist.description
  };
};

module.exports.artProfile = (art) => {
  return {
    identification: art.identification,
    ownership: art.ownership
  };
};
