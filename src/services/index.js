const AlbumsService = require('./postgres/AlbumsService');
const SongsService = require('./postgres/SongsService');
const UsersService = require('./postgres/UserService');
const AuthenticationsService = require('./postgres/AuthenticationsService');
const PlaylistsService = require('./postgres/PlaylistsService');
const ActivitiesPlaylistService = require('./postgres/ActivitiesPlaylistService');
const CollaborationsService = require('./postgres/CollaborationsService');

module.exports = {
  ActivitiesPlaylistService,
  AlbumsService,
  AuthenticationsService,
  CollaborationsService,
  PlaylistsService,
  SongsService,
  UsersService,
};
