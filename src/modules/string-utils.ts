export const ucFirst = (word) => word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();

export const addAffixTo = (word, prefix = '', suffix = '') => prefix + word + suffix;

export default { ucFirst, addAffixTo };
