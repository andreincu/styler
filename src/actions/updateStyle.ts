// sync layer style with shared style
export default (layer, style, styleType) => {
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;

  style[styleProp] = layer[layerProp];
};
