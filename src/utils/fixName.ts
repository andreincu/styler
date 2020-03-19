// required to set the status of a style (publish OR unpublish)

export default layer => {
  // replace underscore char with underscore unicode 
  if (layer.name[0] === '_') {
    '\u005f' + layer.slice(1);
  }
  // replace underscore char with underscore unicode 
  else if (layer.name[0] === '.') {
    '\u002e' + layer.slice(1);
  }

  return layer.name;
}