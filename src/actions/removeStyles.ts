// removing all local styles
export default (styles, counter) => {
  styles.map(style => {
    style.remove();
    counter.removed++;
  });
};
