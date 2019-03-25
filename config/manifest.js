'use strict';

const envKey = key => {
  const env = process.env.NODE_ENV || 'development';

  const configuration = {
    development: {
      host: 'localhost',
      port: 8000
    },
    uat: {
      host: 'localhost',
      port: 8010
    },
    // These should match environment variables on hosted server
    production: {
      host: process.env.HOST,
      port: process.env.PORT
    }
  };

  return configuration[env][key];
};

const manifest = {
  server: {
    port: envKey('port')
  },
  register: {
    plugins: [
      {
        plugin: 'hapi-auth-jwt2'
      },
      {
        plugin: './plugins/auth'
      },
      {
        plugin: './api/core'
      },
      {
        plugin: './api/admin',
        routes: {
          prefix: '/admin'
        }
      },
      {
        plugin: 'good',
        options: {
          ops: {
            interval: 60000
          },
          reporters: {
            console: [
              {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{ response: '*', log: '*', error: '*' }]
              },
              {
                module: 'good-console'
              },
              'stdout'
            ]
          }
        }
      }
    ],
    options: {}
  }
};

module.exports = manifest;