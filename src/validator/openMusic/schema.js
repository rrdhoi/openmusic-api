const joi = require('joi');

const AlbumPayloadSchema = joi.object({
  name: joi.string().required(),
  year: joi.number().required(),
});

const SongPayloadSchema = joi.object(
  {
    title: joi.string().required(),
    year: joi.number().required(),
    genre: joi.string().required(),
    performer: joi.string().required(),
    duration: joi.number(),
    albumId: joi.string(),
  },
);

module.exports = { AlbumPayloadSchema, SongPayloadSchema };
