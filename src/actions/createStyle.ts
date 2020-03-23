import modifiedName from '../utils/modifiedName';

export default (layer, styleType) => {
  const layerId = styleType.layer.id;
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;

  let newStyle = styleType.style.create();
  newStyle[styleProp] = layer[layerProp];
  newStyle.name = modifiedName(layer, styleType.affix);
  layer[layerId] = newStyle.id;

  return newStyle;
};
