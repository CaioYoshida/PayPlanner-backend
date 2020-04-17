
exports.up = function(knex) {
  return knex.schema.createTable('bills', function (table) {
    table.increments();
    table.string('title').notNullable();
    table.date('date').notNullable();
    table.float('value');
    table.timestamps(true, true);
    // relation between bills and users
    table.integer('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bills');
};

