'use strict';

const Glue = require('glue');
const manifest = require('./config/manifest');

if (!process.env.PRODUCTION) {
  manifest.register.plugins.push({
    plugin: "blipp",
    options: {}
  });
}

const options = {
  relativeTo: __dirname
};

const startServer = async function () {
  try {
    const server = await Glue.compose(manifest, options);
    await server.start();
    console.log('✅  API Server is listening on ' + server.info.uri.toLowerCase());
  }
  catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
