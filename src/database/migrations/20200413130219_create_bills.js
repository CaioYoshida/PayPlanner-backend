exports.up = function(knex) {
  return knex.schema.createTable('bills', function (table) {
    table.increments();
    table.string('title').notNullable();
    table.date('date').notNullable();
    table.float('value');
    table.timestamps(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bills');
};
