exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR (50)',
      references: 'albums',
    },
    title: {
      type: 'text',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    performer: {
      type: 'text',
      notNull: true,
    },
    genre: {
      type: 'text',
      notNull: true,
    },
    duration: {
      type: 'integer',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
