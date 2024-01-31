const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor(cachesService) {
    this._cachesService = cachesService;
    this._pool = new Pool();
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cachesService.get(`albumLikes:${albumId}`);
      return {
        dataSource: 'cache',
        data: JSON.parse(result),
      };
    } catch (e) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cachesService.set(`albumLikes:${albumId}`, JSON.stringify(result.rowCount));

      return result.rowCount;
    }
  }

  async addAlbumLikes(albumId, userId) {
    const id = `albumLikes-${nanoid(16)}`;

    const query = {
      text: `
            INSERT INTO user_album_likes (id, user_id, album_id)
            SELECT $1, CAST($2 AS VARCHAR), CAST($3 AS VARCHAR) WHERE NOT EXISTS (SELECT 1 FROM user_album_likes WHERE album_id = $3 AND user_id = $2)
            RETURNING id
      `,
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    await this._cachesService.delete(`albumLikes:${albumId}`);

    if (!result.rowCount) {
      throw new InvariantError('Like gagal ditambahkan');
    }
  }

  async deleteAlbumLikes(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    await this._cachesService.delete(`albumLikes:${albumId}`);

    if (!result.rowCount) {
      throw new InvariantError('Like gagal dihapus');
    }
  }
}

module.exports = AlbumLikesService;
