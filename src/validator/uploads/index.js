const InvariantError = require('../../exceptions/InvariantError');
const { AlbumCoverHeadersSchema } = require('./schema');

const UploadsValidator = {
  validateAlbumCoverHeaders: (headers) => {
    const validationResult = AlbumCoverHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
