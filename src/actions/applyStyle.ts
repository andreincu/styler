// sync layer style with shared style
export default (layer, nameMatch, styleType) => {
  const layerId = styleType.layer.id;
  if (nameMatch) {
    layer[layerId] = nameMatch.id;
  }
};
