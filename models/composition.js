const db = require('../config/dbConfig.js');
const tables = {
  COMPOSITIONS: 'compositions',
  MATERIALS: 'materials',
};

class Composition {
  constructor(payload) {
    this.parent_id = payload.parent_id; // number
    this.material_id = payload.material_id; // number
    this.qty = payload.qty; // number

    this.base_power = payload.base_power; // number - added from material to simplify calculations
    this.material_qty = payload.material_qty; // number - added from material to simplify calculations
    this.child = []; // Composition array for chaining all children
  }

  static async find(material_id) {
    const composition = await db(tables.COMPOSITIONS).where('material_id', material_id).select();
    if (!composition) return null;
    return new Composition(composition);
  }

  /**
   * Recursively finds the tree view of all materials that make up a composition
   * Based on the example provided in the README.md
   * @param {*} parent_id // id to move to next step in recursion
   * @param {*} qty // the quantity required to make 1 unit of the parent id
   * @param {*} base_power // joined from MATERIALS table to prevent additional fetches later
   * @param {*} child // array to hold next step in chain
   * @returns returns a Composition tree with the last elements of a branch having an empty child
   */
  static async findCompositionTree(parent_id, qty, base_power, child, material_qty) {
    const compositionTree = compositionTreeRecursive(parent_id, qty, base_power, child, material_qty);
    if (!compositionTree) return null;
    return compositionTree;
  }
  
}

module.exports = Composition;

async function compositionTreeRecursive(parent_id, qty, base_power, child, material_qty) {
  const materialTree = await db(tables.COMPOSITIONS)
    .where('parent_id', parent_id)
    .innerJoin(tables.MATERIALS, 'compositions.material_id', 'materials.id')
    .select('compositions.parent_id', 'compositions.material_id', 'compositions.qty', 'materials.base_power', 'materials.qty AS material_qty')
    .where('materials.deleted_at', null)
    .then(compositions => {
      const promises = compositions.map(composition => {
        const node = new Composition({ parent_id: composition.material_id, qty: composition.qty, base_power: composition.base_power, child: [], material_qty: composition.material_qty });
        child.push(node);
        return compositionTreeRecursive(composition.material_id, node.qty, node.base_power, node.child, material_qty );
      })
      return Promise.all(promises);
    });
  if (!materialTree) return null;
  return materialTree;
}