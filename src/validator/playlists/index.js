const { postSongPlaylistPayload, postPlaylistPayload } = require('./schema');

const InvariantError = require('../../exceptions/InvariantError');

const PlaylistsValidator = {
  validatePostSongPlaylistPayload: (payload) => {
    const validationResult = postSongPlaylistPayload.validate(payload);
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostPlaylistPayload: (payload) => {
    const validationResult = postPlaylistPayload.validate(payload);
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
