const Home = require('./handlers/home');
const Auth = require('./handlers/auth');
const Admins = require('./handlers/admins');
const Artists = require('./handlers/artists');
const Arts = require('./handlers/arts');
const ArtRevisions = require('./handlers/artRevisions');
const Pointers = require('./handlers/pointers');
const Applications = require('./handlers/applications');
const ApplicationTokens = require('./handlers/applicationTokens');

const register = async (server, options) => {

  server.route([
    { method: 'GET', path: '/', config: Home.hello },

    { method: 'POST', path: '/login', config: Auth.login },
    { method: 'POST', path: '/forget-password', config: Auth.forgetPassword },
    { method: 'POST', path: '/change-password', config: Auth.changePassword },

    { method: 'GET', path: '/admins', config: Admins.list },
    { method: 'GET', path: '/admins/{adminId}', config: Admins.getData },
    { method: 'POST', path: '/admins', config: Admins.create },
    { method: 'PUT', path: '/admins/{adminId}/status', config: Admins.updateStatus },

    { method: 'GET', path: '/artists', config: Artists.list },
    { method: 'GET', path: '/artists/{artistId}', config: Artists.getData },
    { method: 'POST', path: '/artists/{artistId}/approve', config: Artists.approve },

    { method: 'GET', path: '/arts', config: Arts.list },
    { method: 'GET', path: '/arts/{artId}', config: Arts.getData },
    { method: 'POST', path: '/arts/{artId}/approve', config: Arts.approve },

    { method: 'GET', path: '/art_revisions', config: ArtRevisions.list },
    { method: 'GET', path: '/art_revisions/{artRevisionId}', config: ArtRevisions.getData },
    { method: 'POST', path: '/art_revisions/{artRevisionId}/approve', config: ArtRevisions.approve },

    { method: 'GET', path: '/pointers', config: Pointers.list },
    { method: 'GET', path: '/pointers/{pointerId}', config: Pointers.getData },
    { method: 'POST', path: '/pointers/{pointerId}/approve', config: Pointers.approve },

    { method: 'GET', path: '/applications', config: Applications.list },
    { method: 'GET', path: '/applications/{applicationId}', config: Applications.getData },
    { method: 'POST', path: '/applications/{applicationId}/approve', config: Applications.approve },

    { method: 'GET', path: '/applications/{applicationId}/tokens', config: ApplicationTokens.list },
    { method: 'POST', path: '/applications/{applicationId}/tokens', config: ApplicationTokens.create },
    { method: 'POST', path: '/applications/{applicationId}/tokens/{tokenId}/invalidate', config: ApplicationTokens.invalidate },

  ]);

};

exports.plugin = {
  register: register,
  name: 'api-admin'
};
