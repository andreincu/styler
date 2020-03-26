// sync layer style with shared style
export default (layer, nameMatch, styleType, counter) => {
  const layerId = styleType.layer.id;
  if (nameMatch) {
    layer[layerId] = nameMatch.id;
    counter.applied++;
  } else {
    counter.ignored++;
  }
};
