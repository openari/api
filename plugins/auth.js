require('dotenv').config();

const register = async (server, options) => {

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWTTOKEN_SECRET,
    verifyOptions: {
      algorithms: ['HS256']
    },
    // Implement validation function
    validate: async (decoded, request) => {

    }
  });

  server.auth.strategy('jwt-admin', 'jwt', {
    key: process.env.JWTTOKEN_SECRET,
    verifyOptions: {
      algorithms: ['HS256']
    },
    // Implement validation function
    validate: async (decoded, request) => {

    }
  });

  // Uncomment this to apply default auth to all routes
  //plugin.auth.default('jwt');
};

exports.plugin = {
  register: register,
  name: 'auth'
};
