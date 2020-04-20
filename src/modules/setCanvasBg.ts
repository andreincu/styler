import clone from './clone';

export default (red = 0, green = 0, blue = 0) => {
  const canvasBg = clone(figma.currentPage.backgrounds);
  canvasBg[0].color = {
    r: red,
    g: green,
    b: blue,
  };

  return (figma.currentPage.backgrounds = canvasBg);
};
