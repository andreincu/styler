// get style name by layer name
export default (layer, styles) => {
  const cleanStyles = styles.filter(style => {
    if (style.type === 'PAINT') {
      style.name + '-fill' === layer.name;
      style.name + '-stroke' === layer.name;
    } else {
      style.name === layer.name;
    }
  });
  return cleanStyles;
};
