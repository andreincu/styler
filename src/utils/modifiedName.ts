export default (item, affix) => {
  const modifiedName = affix.prefix + item.name + affix.suffix;

  return modifiedName;
};
