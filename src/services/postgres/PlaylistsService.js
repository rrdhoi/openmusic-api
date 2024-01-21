const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationService = collaborationsService;
    this.tblPlaylists = 'playlists';
    this.tblPlaylistSongs = 'playlist_songs';
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO ${this.tblPlaylists} VALUES($1, $2, $3) RETURNING id`,
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, s.username
              FROM ${this.tblPlaylists} as p
              LEFT JOIN collaborations as c ON c.playlist_id = p.id
              LEFT JOIN users as s ON s.id = p.owner
              WHERE p.owner = $1 OR c.user_id = $1
              GROUP BY p.id, s.id
            `,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: `DELETE FROM ${this.tblPlaylists} WHERE ${this.tblPlaylists}.id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongPlaylist({ playlistId, songId }) {
    const id = nanoid(16);

    const query = {
      text: `INSERT INTO ${this.tblPlaylistSongs} VALUES($1, $2, $3) RETURNING id`,
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }
  }

  async getSongsPlaylist(playlistId) {
    const queryGetPlaylistById = {
      text: `SELECT p.id, p.name, u.username FROM ${this.tblPlaylists} AS p
         LEFT JOIN users AS u ON u.id = p.owner
         WHERE p.id = $1`,
      values: [playlistId],
    };

    const queryGetSongs = {
      text: `SELECT s.id, s.title, s.performer FROM songs AS s
         LEFT JOIN playlist_songs AS ps ON s.id = ps.song_id
         WHERE ps.playlist_id = $1
         GROUP BY s.id`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryGetPlaylistById);
    const resultSongs = await this._pool.query(queryGetSongs);

    if (!resultPlaylist.rowCount) {
      throw new InvariantError('Playlist tidak ditemukan');
    }

    return resultPlaylist.rows.map(({
      id,
      name,
      username,
    }) => ({
      id,
      name,
      username,
      songs: resultSongs.rows,
    }))[0];
  }

  async deleteSongPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM ${this.tblPlaylistSongs} WHERE ${this.tblPlaylistSongs}.song_id = $1 AND ${this.tblPlaylistSongs}.playlist_id = $2 RETURNING id`,
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song pada playlist gagal dihapus');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
