// get style id by layer id
export default (localStyles, layer) => localStyles.find(style => layer.fillStyleId === style.id);