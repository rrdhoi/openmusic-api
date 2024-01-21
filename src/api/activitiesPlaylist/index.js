const ActivitiesPlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'activities_playlist',
  version: '1.0.0',
  register: async (server, { activitiesPlaylistService, playlistsService }) => {
    const activitiesPlaylistHandler = new ActivitiesPlaylistHandler(activitiesPlaylistService,
      playlistsService);
    server.route(routes(activitiesPlaylistHandler));
  },
};
