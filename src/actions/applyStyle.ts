import getStyleByName from '../utils/getStyleByName';

// sync layer style with shared style
export default (layer, style, styleType) => {
  const layerId = styleType.layer.id;
  layer[layerId] = style.id;
};
