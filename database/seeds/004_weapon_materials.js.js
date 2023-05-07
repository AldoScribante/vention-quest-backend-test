/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 * populates the n:n cross table for weapon compositions
 * Excalibur (weapon_id: 1 requires material_ids: 1,6,9,12)
 * | NOTE: added qty which defaults to 1 based on the data given but could 
 * | allow for changing qty as well as materials for complex recipes
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return knex('weapon_material')
  .del()
  .then( function () {
    return knex('weapon_material').insert([
      {weapon_id: 1, material_id: 1, qty: 1},
      {weapon_id: 1, material_id: 6, qty: 1},
      {weapon_id: 1, material_id: 9, qty: 1},
      {weapon_id: 1, material_id: 12, qty: 1},
      {weapon_id: 2, material_id: 6, qty: 1},
      {weapon_id: 3, material_id: 9, qty: 1},
      {weapon_id: 3, material_id: 12, qty: 1},
    ]);
  })
};