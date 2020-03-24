import modifiedName from '../utils/modifiedName';
import applyStyle from './applyStyle';

export default (layer, styleType) => {
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;

  let newStyle = styleType.style.create();
  if (styleType.type === 'TEXT') {
    getTextProperties(layer, newStyle, styleType);
  } else {
    newStyle[styleProp] = layer[layerProp];
    newStyle.name = modifiedName(layer, styleType.affix);
  }

  return newStyle;
};

async function getTextProperties(layer, style, styleType) {
  const textProp = styleType.style.textProp;
  await figma.loadFontAsync(layer.fontName);

  textProp.map(prop => (style[prop] = layer[prop]));
  style.name = modifiedName(layer, styleType.affix);
  applyStyle(layer, style, styleType);
}
