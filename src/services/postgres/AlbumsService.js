const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
    this.tblAlbums = 'albums';
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO ${this.tblAlbums} VALUES($1, $2, $3) RETURNING id`,
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(albumId) {
    const queryAlbum = {
      text: `SELECT * FROM ${this.tblAlbums} WHERE ${this.tblAlbums}.id = $1;`,
      values: [albumId],
    };

    const querySongs = {
      text: 'SELECT * FROM songs WHERE songs.album_id = $1;',
      values: [albumId],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    const resultSong = await this._pool.query(querySongs);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return resultAlbum.rows.map(({
      id,
      name,
      year,
    }) => ({
      id,
      name,
      year,
      songs: resultSong.rows,
    }))[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: `UPDATE ${this.tblAlbums} SET name = $1, year = $2 WHERE id = $3 RETURNING id`,
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: `DELETE FROM ${this.tblAlbums} WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
