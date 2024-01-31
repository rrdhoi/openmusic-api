const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDetailSongDBToModel, mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
    this.tblSongs = 'songs';
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO ${this.tblSongs} VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, albumId, title, year, performer, genre, duration],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = `SELECT * FROM ${this.tblSongs} WHERE 1=1`;

    if (title !== '') {
      const loweredTitle = title.toLowerCase();
      query += ` AND LOWER(${this.tblSongs}.title) LIKE '${loweredTitle}%'`;
    }

    if (performer !== '') {
      const loweredPerformer = performer.toLowerCase();
      query += ` AND LOWER(${this.tblSongs}.performer) LIKE '${loweredPerformer}%'`;
    }

    const result = await this._pool.query(query);
    return result.rows.map(mapSongsDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: `SELECT * FROM ${this.tblSongs} WHERE id = $1`,
      values: [id],
    };
    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return mapDetailSongDBToModel(rows[0]);
  }

  async editSongById(id, {
    albumId, title, year, genre, performer, duration,
  }) {
    const query = {
      text: `UPDATE ${this.tblSongs} SET album_id = $1, title = $2, year = $3, genre = $4, performer = $5, duration = $6 WHERE id = $7 RETURNING id`,
      values: [albumId, title, year, genre, performer, duration, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: `DELETE FROM ${this.tblSongs} WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
