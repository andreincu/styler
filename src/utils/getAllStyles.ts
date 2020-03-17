// get all local color, effect, text styles from the document

//TODO extend to doesn't from below
// ignoring grid style for the moment
// ignoring effect style for the moment

export default () => {
  let localStyles = [];
  localStyles.push(figma.getLocalPaintStyles());
  localStyles.push(figma.getLocalTextStyles());
  // grid
  // effect

  localStyles = localStyles.flat();

  return localStyles;
}