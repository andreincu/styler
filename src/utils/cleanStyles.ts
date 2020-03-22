// get all local color, effect, text styles from the document

//TODO extend to doesn't from below
// ignoring grid style for the moment
// ignoring effect style for the moment

export default () => {
  const styleTypes = {
    paint: figma.getLocalPaintStyles(),
    text: figma.getLocalTextStyles(),
    effect: figma.getLocalEffectStyles(),
    grid: figma.getLocalGridStyles()
  };

  let styles = [];
  for (const key in styleTypes) {
    styles.push(styleTypes[key]);
  }

  styles = styles.flat();

  return styles;
};
