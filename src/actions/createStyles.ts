import modifiedName from '../utils/modifiedName';
import applyStyles from './applyStyles';

export default (layer, options) => {
  let newStyle = options.createStyle();
  newStyle.paints = options.layerProperties;
  newStyle.name = modifiedName(options.prefix, layer, options.suffix);
};
