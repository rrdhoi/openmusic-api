const { AlbumsValidator } = require('./albums/index');
const { SongsValidator } = require('./songs/index');
const { AuthenticationsValidator } = require('./authentications/index');
const { UsersValidator } = require('./users/index');
const { PlaylistsValidator } = require('./playlists/index');
const { CollaborationsValidator } = require('./collaborations/index');

module.exports = {
  AlbumsValidator,
  SongsValidator,
  AuthenticationsValidator,
  UsersValidator,
  PlaylistsValidator,
  CollaborationsValidator,
};
