import modifiedName from '../utils/modifiedName';
// import getTextProperties from '../utils/getTextProperties';

export default (layer, styleType) => {
  const layerProp = styleType.layer.prop;
  const styleProp = styleType.style.prop;

  let newStyle = styleType.style.create();
  if (styleType.type === 'TEXT') {
    getTextProperties(layer, newStyle, styleType);
  } else {
    newStyle[styleProp] = layer[layerProp];
  }
  newStyle.name = modifiedName(layer, styleType.affix);

  return newStyle;
};

async function getTextProperties(layer, style, styleType) {
  const textProp = styleType.style.textProp;
  const fontName = layer.fontName;
  let test = await figma.loadFontAsync(fontName);
  console.log(test);
  debugger;

  return textProp.map(prop => (style[prop] = layer[prop]));
}
