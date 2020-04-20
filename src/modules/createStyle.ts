import modifiedName from './modifiedName';

export default async (layer, styleType) => {
  let newStyle = styleType.style.create();
  const { id: layerId, prop: layerProp } = styleType.layer;
  const { prop: styleProp } = styleType.style;

  if (styleType.type === 'TEXT') {
    const { textProp } = styleType.style;

    // Asking nicely for fontName
    await figma.loadFontAsync(layer.fontName);

    newStyle[styleProp] = layer[layerProp];
    textProp.map(prop => (newStyle[prop] = layer[prop]));
    newStyle.name = modifiedName(layer.name, styleType.affix);
    layer[layerId] = newStyle.id;
  } else {
    newStyle[styleProp] = layer[layerProp];
    newStyle.name = modifiedName(layer.name, styleType.affix);
    layer[layerId] = newStyle.id;
  }

  return newStyle;
};
