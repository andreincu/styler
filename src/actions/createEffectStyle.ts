import modifiedName from '../utils/modifiedName';

export default layer => {
  let newStyle = figma.createEffectStyle();
  newStyle.effects = layer.effects;
  newStyle.name = modifiedName('', layer, '');
  layer.effectStyleId = newStyle.id;
};
