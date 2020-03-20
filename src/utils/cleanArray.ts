import isText from './isText';
import isContainer from './isContainer';
import isShape from './isShape';

export default layers => {
  return layers.filter(layer => {
    return isText(layer) || isContainer(layer) || isShape(layer);
  });
};
