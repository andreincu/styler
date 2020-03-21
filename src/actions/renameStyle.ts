import hasFills from '../utils/hasFills';
import hasStrokes from '../utils/hasStrokes';

// sync layer style with shared style
export default (localStyle, layer) => {
  if (hasFills(layer)) {
    return (localStyle.name = layer.name + '-fill');
  }
  if (hasStrokes(layer)) {
    return (localStyle.name = layer.name + '-stroke');
  }
};
