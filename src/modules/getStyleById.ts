// get style name by layer name
export default (layer, styles, styleType) => {
  const layerId = styleType.layer.id;
  return styles.find(style => style.id === layer[layerId]);
};
