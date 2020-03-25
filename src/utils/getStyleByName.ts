import modifiedName from './modifiedName';

// get style name by layer name
export default (layer, styles, styleType) => {
  const layerName = modifiedName(layer, styleType.affix);

  return styles.find(style => style.name === layerName);
};
