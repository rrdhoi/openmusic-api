const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(albumLikesService, albumsService) {
    this._albumLikesService = albumLikesService;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.verifyAlbumIsExists(albumId);

    const albumLikeId = await this._albumLikesService.addAlbumLikes(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
      data: {
        albumLikeId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const albumLikes = await this._albumLikesService.getAlbumLikes(albumId);

    if (!albumLikes.dataSource) {
      return {
        status: 'success',
        message: 'Likes berhasil didapatkan',
        data: {
          likes: albumLikes,
        },
      };
    }

    return h.response({
      status: 'success',
      message: 'Likes berhasil didapatkan',
      data: {
        likes: albumLikes.data,
      },
    }).header('X-Data-Source', 'cache');
  }

  async deleteAlbumLikesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumLikesService.deleteAlbumLikes(albumId, credentialId);

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }
}

module.exports = AlbumLikesHandler;
