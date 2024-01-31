exports.up = (pgm) => {
  pgm.sql('ALTER TABLE albums '
        + 'ADD COLUMN cover text');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE albums '
        + 'DROP COLUMN cover');
};
