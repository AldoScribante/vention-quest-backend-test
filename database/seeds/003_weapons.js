/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 * Note compositions is in weapon_material table
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return knex('weapons')
  .del()
  .then( function () {
    return knex('weapons').insert([
      {id: 1, name: 'Excalibur', power_level: 20630, qty: 1}, 
      {id: 2, name: 'Magic Staff', power_level: 3250, qty: 1},
      {id: 3, name: 'Axe', power_level: 12040, qty: 1}, //in example, added as additional test and to verify output
    ]);
  })
};
