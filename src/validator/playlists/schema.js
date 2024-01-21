const joi = require('joi');

const postSongPlaylistPayload = joi.object(
  {
    songId: joi.string().required(),
  },
);

const postPlaylistPayload = joi.object(
  {
    name: joi.string().required(),
  },
);

module.exports = { postPlaylistPayload, postSongPlaylistPayload };
