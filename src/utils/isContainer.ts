// I refer as CONTAINER to layer that can have grid
// FRAME, COMPONENTS, INSTANCES
// GROUPS are excluded from this category
export default layer => {
  const whitelist = ['FRAME', 'COMPONENT', 'INSTANCE'];
  return whitelist.includes(layer.type);
};
