const mapDetailSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapSongsDBToModel = ({ id, title, performer }) => ({ id, title, performer });

module.exports = { mapSongsDBToModel, mapDetailSongDBToModel };
