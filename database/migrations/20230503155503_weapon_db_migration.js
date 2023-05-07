/**
 * @param {import('knex').Knex} knex
 * Creates 2 tables for weapons
 * - weapons table to store weapon information: name, power_level, qty
 * - weapon_material to store weapon composition info. n:n cross table with weapon_id and material_id and qty of materials
 *     - Used because it allows the most freedom to add new materials, change "recipes", and seperates critical weapon info from recipe info
 *     - this table could also be extended to hold other recipes based on base materials i.e armor without the need to duplicate material information 
 *       (add column item_type with weapon or armor info, weapon_id -> item_id or equivalent)
 */
exports.up = async function (knex) {
  await knex.schema.createTable('weapons', function (t) {
    t.increments('id').unsigned().primary();
    t.text('name');
    t.integer('power_level');
    t.integer('qty');
  })

  await knex.schema.createTable('weapon_material', function (t) {
    t.integer('weapon_id');
    t.integer('material_id');
    t.integer('qty');
  })
  
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('weapons')
  await knex.schema.dropTable('weapon_material')
};

