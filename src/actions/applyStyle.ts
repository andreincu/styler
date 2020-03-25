import modifiedName from '../utils/modifiedName';

// sync layer style with shared style
export default (layer, style, styleType, counter) => {
  const layerId = styleType.layer.id;
  if (style && style.name === modifiedName(layer, styleType.affix)) {
    layer[layerId] = style.id;
    counter.applied++;
  } else {
    counter.ignored++;
  }
};
