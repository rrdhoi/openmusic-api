const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getActivitiesPlaylistHandler,
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;
