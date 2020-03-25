// sync layer style with shared style
export default (layer, style, styleType, counter) => {
  const layerId = styleType.layer.id;
  if (style && layer.name === style.name) {
    layer[layerId] = style.id;
    counter.applied++;
  } else {
    counter.ignored++;
  }
};
