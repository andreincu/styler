// get style name by layer name
export default (localStyles, layer) => localStyles.find(style => style.name === layer.name);