exports.up = (pgm) => {
  pgm.sql('ALTER TABLE users '
      + 'ADD COLUMN album_id VARCHAR(50), '
      + 'ADD CONSTRAINT users_album_id_fkey '
      + 'FOREIGN KEY (album_id) '
      + 'REFERENCES users(id) '
      + 'ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE users '
      + 'DROP CONSTRAINT users_album_id_fkey, '
      + 'DROP COLUMN album_id');
};
