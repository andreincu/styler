export default (layer, styleType, counter) => {
  const layerId = styleType.layer.id;
  layer[layerId] = '';
  counter.detached++;
};
