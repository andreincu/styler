export default layer => {
  if (layer.fillStyleId) layer.fillStyleId = '';
  if (layer.strokeStyleId) layer.strokeStyleId = '';
  if (layer.textStyleId) layer.textStyleId = '';
};
