// I refer as CONTAINER to layer that can have grid
// FRAME, COMPONENTS, INSTANCES
// GROUPS are excluded from this category
export default layer => {
  const whitelist = [
    'RECTANGLE',
    'ELLIPSE',
    'POLYGON',
    'STAR',
    'FRAME',
    'COMPONENT',
    'INSTANCE',
    'TEXT'
  ];
  return whitelist.includes(layer.type);
};
