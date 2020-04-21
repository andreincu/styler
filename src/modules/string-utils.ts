export const ucFirst = word => word[0] + word.slice(1).toLocaleLowerCase();

export const addAffix = (word, affix = { prefix: '', suffix: '' }) => affix.prefix + word + affix.suffix;

export default { ucFirst };
