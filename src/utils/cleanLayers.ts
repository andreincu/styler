import checkLayerType from './checkLayerType';

export default layers => {
  return layers.filter(layer => checkLayerType(layer));
};
