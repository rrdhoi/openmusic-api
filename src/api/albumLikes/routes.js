const routes = (handler) => [
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikesHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postAlbumLikesHandler,
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteAlbumLikesHandler,
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;
