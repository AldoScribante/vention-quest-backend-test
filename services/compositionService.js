const { find } = require('../models/composition');
const { findCompositionTree } = require('../models/composition');

const CompositionService = () => {
  const getComposition = async (material_id) => {
    return find(material_id);
  };

  const getCompositionTree = async (parent_id, qty, base_power, child) => {
    return findCompositionTree(parent_id, qty, base_power, child);
  };

  return {
    getComposition,
    getCompositionTree,
  };
};

module.exports = CompositionService;