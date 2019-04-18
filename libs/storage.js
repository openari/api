'use strict';

require('dotenv').config();

const Storage = require('@google-cloud/storage');
const gcs = new Storage({ projectId: process.env.PROJECT_ID });

module.exports.upload = async (bucketname, fileStream, mimetype, gcsname) => {

  const bucket = gcs.bucket(bucketname);

  var remoteWriteStream = bucket.file(gcsname).createWriteStream(
    {
      metadata: {
        contentType: mimetype
      }
    }
  );

  return await new Promise((resolve, reject) => {
    fileStream.pipe(remoteWriteStream)
      .on('error', function(err) {
        console.error('Error in GCP storage lib, upload_storage.', err);
        reject();
      })
      .on('finish', function() {
        resolve(true);
      });
  });
};

module.exports.make_public = async (filename, bucketname) => {

  return await gcs.bucket(bucketname).file(filename).makePublic()
    .then(() => {
      return `https://storage.googleapis.com/${bucketname}/${filename}`;
    })
    .catch(err => {
      console.error('Error in GCP storage lib, make_public.', err);
      throw err;
    });
};

module.exports.file_url = async (filename, bucketname) => {
  const url = `https://storage.googleapis.com/${bucketname}/${filename}`;
  return new Promise(url);
};

module.exports.download = async (bucketname, gcsname) => {

  const bucket = gcs.bucket(bucketname);

  return await bucket.file(gcsname).download();
};
