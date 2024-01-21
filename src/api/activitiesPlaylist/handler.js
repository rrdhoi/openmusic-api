const autoBind = require('auto-bind');

class ActivitiesPlaylistHandler {
  constructor(activitiesPlaylistService, playlistsService) {
    this._activitiesPlaylistService = activitiesPlaylistService;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    const activities = await this._activitiesPlaylistService.getActivitiesPlaylist(id);

    return {
      status: 'success',
      data: activities,
    };
  }
}

module.exports = ActivitiesPlaylistHandler;
