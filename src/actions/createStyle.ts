import modifiedName from '../utils/modifiedName';

export default async (layer, styleType) => {
  let newStyle;
  const layerId = styleType.layer.id;
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;

  if (styleType.type === 'TEXT') {
    const textProp = styleType.style.textProp;
    newStyle = styleType.style.create();

    // Asking nicely for fontName
    await figma.loadFontAsync(layer.fontName);

    newStyle[styleProp] = layer[layerProp];
    textProp.map(prop => (newStyle[prop] = layer[prop]));
    newStyle.name = modifiedName(layer.name, styleType.affix);
    layer[layerId] = newStyle.id;
  } else {
    newStyle = styleType.style.create();
    newStyle[styleProp] = layer[layerProp];
    newStyle.name = modifiedName(layer.name, styleType.affix);
    layer[layerId] = newStyle.id;
  }

  return newStyle;
};
