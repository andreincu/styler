import hasFills from '../utils/hasFills';

export default layer => {
  const fillStyle = figma.createPaintStyle();
  const strokeStyle = figma.createPaintStyle();

  if (hasFills(layer)) {
    fillStyle.name = layer.name + '-fill';
    fillStyle.paints = layer.fills;
    layer.fillStyleId = fillStyle.id;
  }
  if (hasFills(layer)) {
    strokeStyle.name = layer.name + '-fill';
    strokeStyle.paints = layer.fills;
    layer.strokeStyle = strokeStyle.id;
  }

  return [fillStyle, strokeStyle];
};
