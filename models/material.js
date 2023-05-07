const db = require('../config/dbConfig.js');
const tables = {
  WEAPONS: 'weapons',
  MATERIALS: 'materials',
  WEAPON_MATERIAL: 'weapon_material',
}

class Material {
  constructor(payload) {
    this.id = payload.id;
    this.name = payload.name;
    this.base_power = payload.base_power;
    this.qty = payload.qty;
    this.deleted_at = payload.deleted_at;
  }

  static async find(id) {
    const material = await db(tables.MATERIALS).where('id', id).first();
    if (!material) return null;
    return new Material(material);
  }

  /**
   * Selects all materials associated with a weapon ID using the WEAPON_MATERIAL cross table
   * @param {*} weapon_id 
   * @returns Array of base materials
   */
  static async findMaterialWeapon(weapon_id) {
    const materialsWeapon = await db(tables.WEAPONS)
    .select('materials.id', 'materials.name', 'materials.base_power', 'materials.qty')
    .innerJoin(tables.WEAPON_MATERIAL, 'weapons.id', 'weapon_material.weapon_id')
    .innerJoin(tables.MATERIALS, 'weapon_material.material_id', 'materials.id')
    .where('weapons.id', weapon_id)
    .where('materials.deleted_at', null);

    if(!materialsWeapon) return null;
    return materialsWeapon.map(material => new Material(material));
  }

  /**
   * Quest 3 & 4: Update material class with body
   * @param {*} material_id 
   * @param {*} body 
   * @returns 
   */
  static async update(material_id, body) {
    const materialUpdate = await db(tables.MATERIALS).where('id', material_id).update(body);

    if(!materialUpdate) return null;
    return materialUpdate; 
  }
}

module.exports = Material;
