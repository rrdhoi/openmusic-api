require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

const openMusicApi = require('./api');
const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const {
  AlbumsService, SongsService, UsersService, AuthenticationsService,
  PlaylistsService, ActivitiesPlaylistService, CollaborationsService, AlbumLikesService,
  CacheService,
} = require('./services');

const AuthenticationsValidator = require('./validator/authentications');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const PlaylistsValidator = require('./validator/playlists');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');
const config = require('./utils/config');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const cacheService = new CacheService();
  const usersService = new UsersService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService(cacheService);
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const activitiesPlaylistService = new ActivitiesPlaylistService();
  const albumLikesService = new AlbumLikesService(cacheService);

  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: openMusicApi.albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: openMusicApi.songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: openMusicApi.users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: openMusicApi.playlists,
      options: {
        playlistsService,
        songsService,
        activitiesPlaylistService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: openMusicApi.authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: openMusicApi.activitiesPlaylist,
      options: {
        activitiesPlaylistService,
        playlistsService,
        tokenManager: TokenManager,
      },
    },
    {
      plugin: openMusicApi.collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        tokenManager: TokenManager,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: openMusicApi.albumLikes,
      options: {
        albumLikesService,
        albumsService,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      console.log(`error -> ${response}`);
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      console.log(`error -> ${response}`);

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
