import modifiedName from '../utils/modifiedName';

// sync layer style with shared style
export default (layer, style, styleType) => {
  style.name = modifiedName(layer.name, styleType.affix);
};
