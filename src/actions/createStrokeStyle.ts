import modifiedName from '../utils/modifiedName';

export default layer => {
  let newStyle = figma.createPaintStyle();
  newStyle.paints = layer.strokes;
  newStyle.name = modifiedName('', layer, '-stroke');
  layer.strokeStyleId = newStyle.id;
};
