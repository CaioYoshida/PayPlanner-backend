
exports.up = function(knex) {
  return knex.schema.createTable('users', function (table) {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password');
    table.timestamps(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
