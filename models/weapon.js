const db = require('../config/dbConfig.js');
const MaterialService = require('../services/materialService.js');
const CompositionService = require('../services/compositionService.js');

const tables = {
  WEAPONS: 'weapons',
  MATERIALS: 'materials',
  WEAPON_MATERIAL: 'weapon_material',
}; // base tables for class

class Weapon {
  constructor(payload) {
    this.id = payload.id; // number
    this.name = payload.name; // string
    this.power_level = payload.power_level; // number
    this.qty = payload.qty; // number
    this.max_quantity = payload.max_quantity; // number
  }

  static async find(id) {
    const weapon = await db(tables.WEAPONS).where('id', id).first();
    if(!weapon) return null;
    return new Weapon(weapon);
  }

  //NOTE: for large data sets will need pagination
  static async findAll() {
    // add deleted_at to weapons class
    const weapons = await db(tables.WEAPONS).select('*');
   
    if(!weapons) return null;
    return weapons.map(weapon => new Weapon(weapon));
  }
  
  static async update(weapon_id, body) {
    const materialUpdate = await db(tables.WEAPONS).where('id', weapon_id).update(body);
    if(!materialUpdate) return null;
    return materialUpdate; 
  }

  /**
   * Finds the weapon, fetches its base materials, and their compositions 
   * calls function to calculate the total power level based on the formula provided in README.md.
   * If the recalculated power level is different from the power level in the class, update the DB
   * @param {*} weapon_id 
   * @returns Weapon class with updated powerLevel
   */
  static async getPowerLevel(weapon_id) {
    const weapon = await db(tables.WEAPONS).where('id', weapon_id).first();
    if(!weapon) return null;

    const weaponMaterials = await MaterialService().getMaterialWeapon(weapon_id);

    let weaponPowerLevel = 0;
    let compositionTree = [];
    for(let composition of weaponMaterials) {
      compositionTree = [{ parent_id: +composition.id, qty: 1, base_power: +composition.base_power, child: [], material_qty: composition.material_qty }];
      await CompositionService().getCompositionTree(compositionTree[0].parent_id, compositionTree[0].qty, compositionTree[0].base_power, compositionTree[0].child, compositionTree[0].material_qty);
      weaponPowerLevel += calculatePowerLevel(compositionTree);
    }

    if(weapon.powerLevel != weaponPowerLevel) {
      const body = { power_level: weaponPowerLevel }
      await db(tables.WEAPONS).where('id', weapon.id).update(body);
    } 

    return new Weapon(weapon);
  }

  /**
   * Finds max number of weapons that can be made
   * Finds composition tree of material with qty in inventory
   * Flattens array to look for duplicate materials to determine if those would affect output
   * @param {*} weapon_id 
   * @returns 
   */
  static async getMaxQuantity(weapon_id) {
    const weapon = await db(tables.WEAPONS).where('id', weapon_id).first();
    if(!weapon) return null;

    const weaponMaterials = await MaterialService().getMaterialWeapon(weapon_id);

    let compositionTree = [];
    let allCompositions = [];
    let flatCompositions = [];

    for(let composition of weaponMaterials) {
      compositionTree = [{ parent_id: +composition.id, qty: 1, base_power: +composition.base_power, child: [], material_qty: +composition.qty }];
      await CompositionService().getCompositionTree(compositionTree[0].parent_id, compositionTree[0].qty, compositionTree[0].base_power, compositionTree[0].child, compositionTree[0].material_qty); 

      allCompositions.push(compositionTree)
      flatCompositions.push( flattenArray(compositionTree) );
    }

    let qtyFactorArray = createQtyFactorArray(flatCompositions);
    
    let maxQuantity;
    allCompositions.forEach(composition => {
      const quantity = Math.floor( calculateMaxQuantity(composition, qtyFactorArray) );
      maxQuantity = maxQuantity < quantity ? maxQuantity : quantity;
    })

    weapon.max_quantity = maxQuantity
    return weapon;
  }
}

/**
 * Takes a compositionTree and recursively calculates the total power based on the compositions 
 * @param {*} tree 
 * @returns 
 */
function calculatePowerLevel(tree) {
  let power_level = 0;
  
  tree.forEach(node => {
    power_level += node.qty * (node.base_power + calculatePowerLevel(node.child));
  });
  return power_level;
}


/**
 * Takes a nested material tree and returns a flattened composition array per material
 * @param {*} tree 
 * @returns 
 */
function flattenArray(tree) {
  return tree.reduce((node, flatTree) => {
    const { child, ...rest } = flatTree;
    node.push(rest);
    if (child && child.length > 0) {
      node.push(...flattenArray(child));
    }
    return node;
  }, []);
}

/**
 * Takes array of materials composition arrays and finds duplicates across the branches
 * Creates a factor used to determine the relative proportion of a required material for a weapon composition
 * See README.md for example
 * @param {*} compositionList 
 * @returns 
 */
function createQtyFactorArray(compositionList) {
  let qtyFactorArray = [];
  for(let i = 0; i <= 12; i++) {
    const compositionCount = compositionList.flatMap(compositions => compositions).filter(composiiton => composiiton.parent_id === i);
    if(compositionCount.length > 1) {
      const totalQty = compositionCount.reduce((accumulator, current) => accumulator + current.qty, 0);
      const qtyFactor = { parent_id: compositionCount[0].parent_id, count: compositionCount.length, totalQty: totalQty }
      qtyFactorArray.push(qtyFactor)
    }
  }
  return qtyFactorArray;
}

/**
 * Recursively calculates the quantity of materials required to to make a recipe
 * Applies factor to adjust available ammounts based on useage in other material trees
 * @param {*} tree 
 * @param {*} qtyFactorArray 
 * @returns 
 */
function calculateMaxQuantity(tree, qtyFactorArray) {
  let amount_available = 0;
  let factor = 1;
  
  tree.forEach(node => {
    const qtyFactor = qtyFactorArray.filter(qtyFactor => qtyFactor.parent_id === node.parent_id)[0];
    if(qtyFactor) {
      factor = (node.qty/qtyFactor.totalQty);
    }
    
    amount_available += (( (node.material_qty*factor) + calculateMaxQuantity(node.child, qtyFactorArray) )  / node.qty);
  });

  return amount_available;
}


module.exports = Weapon;
