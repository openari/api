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
  let transformed = {
    id: art.id,
    txhash: art.txhash,
    created_at: art.created_at,
    updated_at: art.updated_at,
    identification: art.identification,
    ownership: art.ownership,
    pointers: art.pointers
  };

  // remove data that is not public
  if (transformed.ownership.price_public !== true) {
    transformed.ownership.price = 'N/A';
  }
  if (transformed.ownership.contact_public !== true) {
    transformed.ownership.email = 'N/A';
    transformed.ownership.phone = 'N/A';
  }
  if (transformed.ownership.owner_public !== true) {
    transformed.ownership.owner = 'N/A';
  }

};
