// removing all local styles
export default counter => {
  [
    figma.getLocalPaintStyles(),
    figma.getLocalTextStyles(),
    figma.getLocalEffectStyles(),
    figma.getLocalGridStyles()
  ]
    .flat()
    .map(style => {
      style.remove();
      counter.removed++;
    });
};
