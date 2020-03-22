import modifiedName from '../utils/modifiedName';

export default layer => {
  let newStyle = figma.createPaintStyle();
  newStyle.paints = layer.fills;
  newStyle.name = modifiedName('', layer, '-fill');
  layer.fillStyleId = newStyle.id;
};
