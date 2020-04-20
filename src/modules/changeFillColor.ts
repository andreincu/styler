import clone from './clone';

export default (layer, red, green, blue) => {
  const cloned = clone(layer.fills);
  cloned[0].color = {
    r: red,
    g: green,
    b: blue,
  };
  return (layer.fills = cloned);
};
