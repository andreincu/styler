export default (item, affix) => {
  const modifiedName = affix.prefix + item + affix.suffix;

  return modifiedName;
};
