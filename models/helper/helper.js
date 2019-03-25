'use strict';

const randomstring = require('randomstring');

module.exports.generateInvitationCode = async (checkDuplicate) => {
  var duplicated = true;
  var invitationCode = '';

  while(duplicated) {
    invitationCode = randomstring.generate(12);
    duplicated = await checkDuplicate(invitationCode);
  }

  return invitationCode;
};