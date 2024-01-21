const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, songsService, activitiesPlaylistService, validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(playlistsService, songsService,
      activitiesPlaylistService, validator);
    server.route(routes(playlistsHandler));
  },
};
