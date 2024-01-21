const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiesPlaylistService {
  constructor() {
    this._pool = new Pool();
    this.tblActivitiesPlaylist = 'playlist_song_activities';
  }

  async addActivityPlaylist({
    userId, playlistId, songId, action,
  }) {
    const id = `activities-playlist-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO ${this.tblActivitiesPlaylist} VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activity playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getActivitiesPlaylist(playlistId) {
    const queryAlbum = {
      text: `SELECT ap.action, TO_CHAR(ap.time, 'YYYY-MM-DD HH24:MI:SS') as time, u.username, s.title 
         FROM ${this.tblActivitiesPlaylist} AS ap
         LEFT JOIN users AS u ON u.id = ap.user_id
         LEFT JOIN songs AS s ON s.id = ap.song_id
         WHERE ap.playlist_id = $1
         GROUP BY ap.id, ap.action, ap.time, u.username, s.title
         ORDER BY ap.time`,
      values: [playlistId],
    };

    const activities = await this._pool.query(queryAlbum);

    return {
      playlistId,
      activities: activities.rows.map(({
        username,
        title,
        action,
        time,
      }) => ({
        username,
        title,
        action,
        time,
      })),
    };
  }
}

module.exports = ActivitiesPlaylistService;
