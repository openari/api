'use strict';

require('dotenv').config();

const Joi = require('joi');

const mailSender = require('../../../config/mailer').mailSender;
const Transformers = require('../helpers/transformers');
const Artists = require('../../../models/artists');

const artistParamsSchema = Joi.object({
  artistId: Joi.number().required()
});

const approveArtistBodySchema = Joi.object({
  approve: Joi.boolean().required()
});

module.exports.list = {
  description: 'List All Artists',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  handler: async function(request, h){

    let finding = await Artists.list();

    finding.artists = finding.artists.map(Transformers.artistProfile);

    return h.response(finding);
  }
};

module.exports.getData = {
  description: 'Get An Artist',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artistParamsSchema
  },
  handler: async function(request, h){

    let artistId = request.params.artistId;
    let artist = await Artists.getArtist(artistId);

    artist = Transformers.artistProfile(artist);

    return h.response(artist);
  }
};

module.exports.approve = {
  description: 'Approve An Artist',
  cors: true,
  auth: {
    strategy: 'jwt-admin'
  },
  validate: {
    params: artistParamsSchema,
    payload: approveArtistBodySchema
  },
  handler: async function(request, h){

    try {
      const artistId = request.params.artistId;
      const approve = request.payload.approve;
      const artist = await Artists.approve(artistId, approve);

      var mail = {
        to: artist.email,
        subject: "藝術家邀請碼 / Artist Invitation Code",
        text: `您的邀請碼為 ${artist.invitation_code}`,
        html: `親愛的藝術家，<br/><br/><h2>歡迎您加入專案計劃！</h2>您的邀請碼為 <code>${artist.invitation_code}</code>。請至專案官網建立您的作品資料。<br/><br/>專案辦公室<br/>Dear Artist,<h2>This is your invitation code, <code>${artist.invitation_code}</code>.<br/>You may now register your art work on the project website.<br/>Have a nice day!<br/><br/>The Project Office`,
      };
      await mailSender.sendMail(mail);

      const response = {};
      response.msg = 'The artist status is successfully updated.';

      return h.response().code(204);
    } catch (e) {
      if (e == 'artist not found') {
        return h.response().code(401);
      }
      throw e;
    }
  }
};
