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
    id: art.id,
    txhash: art.txhash,
    created_at: art.created_at,
    updated_at: art.updated_at,
    identification: art.identification,
    ownership: art.ownership,
    pointers: art.pointers
  };
};
