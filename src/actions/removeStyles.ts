// removing all local styles
export default (styleTypes, counter) => {
  styleTypes.map(styleType => {
    const styles = styleType.style.get();

    styles.map(style => {
      style.remove();
      counter.removed++;
    });
  });
};
