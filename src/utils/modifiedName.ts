export default (prefix, item, suffix) => {
  const modifiedName = prefix + item.name + suffix;

  return modifiedName;
};
