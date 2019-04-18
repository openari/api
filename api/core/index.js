const Home = require('./handlers/home');
const Artists = require('./handlers/artists');
const Images = require('./handlers/images');
const Attachments = require('./handlers/attachments');
const Arts = require('./handlers/arts');
const Pointers = require('./handlers/pointers');
const Applications = require('./handlers/applications');

const register = async (server, options) => {

  server.route([
    { method: 'GET', path: '/', config: Home.hello },

    { method: 'POST', path: '/artists', config: Artists.create },
    { method: 'POST', path: '/artist-verify', config: Artists.verify },

    { method: 'POST', path: '/images', config: Images.upload },
    { method: 'POST', path: '/attachments', config: Attachments.upload },

    { method: 'POST', path: '/arts', config: Arts.create },
    { method: 'GET', path: '/arts', config: Arts.list },
    { method: 'GET', path: '/arts/{artId}', config: Arts.getData },
    { method: 'PUT', path: '/arts/{artId}', config: Arts.update },

    { method: 'POST', path: '/arts/{artId}/pointers', config: Pointers.create },

    { method: 'POST', path: '/applications', config: Applications.create },

  ]);

};

exports.plugin = {
  register: register,
  name: 'api-core'
};
