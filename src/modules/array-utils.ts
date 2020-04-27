// check if array is empty
export const isArrayEmpty = (array) => !(Array.isArray(array) && array.length);

// split array in multiple parts
export const chunk = (array, size = 1) => {
  return isArrayEmpty(array) ? [] : [array.slice(0, size)].concat(chunk(array.slice(size), size));
};

// get unique value from an array
export const uniq = (array, sort = false) => {
  return isArrayEmpty(array) ? [] : !sort ? [...new Set(array)] : [...new Set(array)].sort();
};

// groupBy(array, key): group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);

    return result;
  }, {});
};

export default { chunk, groupBy };
