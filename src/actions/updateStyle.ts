import applyStyle from './applyStyle';

// sync layer style with shared style
export default (layer, style, styleType) => {
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;
  if (styleType.type === 'TEXT') {
    updateTextProperties(layer, style, styleType);
  } else {
    style[styleProp] = layer[layerProp];
    applyStyle(layer, style, styleType);
  }
};

async function updateTextProperties(layer, style, styleType) {
  const textProp = styleType.style.textProp;
  await figma.loadFontAsync(layer.fontName);

  textProp.map(prop => (style[prop] = layer[prop]));
  applyStyle(layer, style, styleType);
}
