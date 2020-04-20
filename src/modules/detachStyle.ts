export default (layer, styleType) => {
  const layerId = styleType.layer.id;
  layer[layerId] = '';
};
