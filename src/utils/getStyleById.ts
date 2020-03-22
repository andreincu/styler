// get style id by layer id
export default layer => {
  let styles = [];
  const styleTypes = {
    fill: layer.fillStyleId,
    strokes: layer.strokesStyleId,
    text: layer.strokesStyleId,
    effect: layer.effectStyleId,
    layoutGrid: layer.gridStyleId
  };

  for (let key in styleTypes) {
    if (styleTypes[key] && styleTypes[key].length > 0) {
      styles.push(figma.getStyleById(styleTypes[key]));
    }
  }

  styles.flat();

  return styles;
};
