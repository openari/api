require('dotenv').config();
const Admins = require('../models/admins');
const ApplicationTokens = require('../models/applicationTokens');

const register = async (server, options) => {

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWTTOKEN_SECRET,
    verifyOptions: {
      algorithms: ['HS256']
    },
    // Implement validation function
    validate: async (decoded, request) => {
      let token =
        await ApplicationTokens.verifyApplicationToken(decoded.token_key);

      return {
        isValid: token !== null
      };
    }
  });

  server.auth.strategy('jwt-admin', 'jwt', {
    key: process.env.JWTTOKEN_SECRET,
    verifyOptions: {
      algorithms: ['HS256']
    },
    // Implement validation function
    validate: async (decoded, request) => {

      const authAdmin = {
        adminId: parseInt(decoded.adminId)
      };

      request.authAdmin = authAdmin;

      try {
        await Admins.statusCheck(authAdmin.adminId);

        return {
          isValid: true,
          credentials: authAdmin
        };
      } catch (e) {
        return {
          isValid: false
        };
      }

    }
  });

  // Uncomment this to apply default auth to all routes
  //plugin.auth.default('jwt');
};

exports.plugin = {
  register: register,
  name: 'auth'
};
