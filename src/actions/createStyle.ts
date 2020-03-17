export default layer => {
  let newStyle = figma.createPaintStyle();

  newStyle.name = layer.name;
  newStyle.paints = layer.fills;
  layer.fillStyleId = newStyle.id;

  return newStyle;
}