const { find } = require('../models/weapon');
const { findAll } = require('../models/weapon');
const { getPowerLevel } = require('../models/weapon');
const { getMaxQuantity } = require('../models/weapon');

const WeaponService = () => {
  const getWeapon = async (id) => {
    return find(id);
  };
  const getAllWeapons = async () => {
    return findAll();
  };
  const getWeaponPowerLevel = async (weapon_id) => {
    return getPowerLevel(weapon_id);
  };
  const getWeaponMaxQuantity = async (weapon_id) => {
    return getMaxQuantity(weapon_id);
  };

  return {
    getWeapon,
    getAllWeapons,
    getWeaponPowerLevel,
    getWeaponMaxQuantity,
  };
};

module.exports = WeaponService;
