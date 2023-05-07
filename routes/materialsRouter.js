const router = require('express').Router();

const MaterialService = require('../services/materialService.js');
const WeaponsService = require('../services/weaponService.js');
const CompositionService = require('../services/compositionService.js');

/**************************************************************************************
 * Quest Endpoints
 *************************************************************************************/

/**
 * Calculates and returns the power level of a weapon based on its compositions
 */
router.get('/weapon/power-level/:weapon_id', async (req, res) => {
  try {
    const weapon = await WeaponsService().getWeaponPowerLevel(req.params.weapon_id);
    res.status(200).json(weapon);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

/**
 * Updates material based on a material_id with 
 * basic protection to ensure that id cannot be modified. 
 * Once material is updated, determines whether to update weapon. 
 * | Based on shared values that would affect weapon i.e base_power or deleted_at.
 */
router.put('/material/:id', async (req, res) => {
  if("id" in req.body) {
    return res.status(500).json({ err: 'Cannot modify material ID' });
  }
  try {
    const material = await MaterialService().putMaterial(req.params.id, req.body);

    if("base_power" in req.body || "deleted_at" in req.body) {
      try{
        const weapons = await WeaponsService().getAllWeapons();
        weapons.forEach(async (wpn) => {
          await WeaponsService().getWeaponPowerLevel(wpn.id);
        });
      } catch (err) {
        return res.status(500).json({ err: err.message });
      }
    }
   
    res.status(200).json({ updated: material });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

/**
 * Returns the maximum number of a weapon that can be crafted
 */
router.get('/weapon/quantity/:weapon_id', async (req, res) => {
  try {
    const weapon = await WeaponsService().getWeaponMaxQuantity(req.params.weapon_id);
    res.status(200).json(weapon);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


/**************************************************************************************
 * Prebuilt
 *************************************************************************************/

// IMPLEMENT CRUD FOR WEAPON
router.get('/material/:id', async (req, res) => {
  try {
    const material = await MaterialService().getMaterial(req.params.id);
    res.status(200).json(material);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

/**************************************************************************************
 * Helper API endpoints for testing
 *************************************************************************************/

router.get('/material/weapon/:weapon_id', async (req, res) => {
  try {
    const material = await MaterialService().getMaterialWeapon(req.params.weapon_id);
    res.status(200).json(material);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/weapon/all', async (req, res) => {
  try {
    const weapon = await WeaponsService().getAllWeapons();
    res.status(200).json(weapon);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/weapon/:id', async (req, res) => {
  try {
    const weapon = await WeaponsService().getWeapon(req.params.id);
    res.status(200).json(weapon);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/composition/tree/:parent_id', async (req, res) => {
  const tree = [{ parent_id: +req.params.parent_id, qty: 1, base_power: 0, child: [] }];
  try {
    await CompositionService().getCompositionTree(tree[0].parent_id, tree[0].qty, tree[0].base_power, tree[0].child);
    res.status(200).json(tree);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
