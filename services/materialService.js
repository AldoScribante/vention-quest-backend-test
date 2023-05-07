const { find } = require('../models/material');
const { findMaterialWeapon } = require('../models/material');
const { update } = require('../models/material');
// const { findMaterialCompositionTree } = require('../models/material');

const MaterialService = () => {
  const getMaterial = async (id) => {
    return find(id);
  };

  const getMaterialWeapon = async (weapon_id) => {
    return findMaterialWeapon(weapon_id);
  };

  const putMaterial = async (id, body) => {
    return update(id, body);
  };

  return {
    getMaterial,
    getMaterialWeapon,
    putMaterial,
  };
};

module.exports = MaterialService;
