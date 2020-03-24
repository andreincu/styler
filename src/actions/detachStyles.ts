export default (layers, styleTypes, counter) =>
  layers.map(layer => {
    styleTypes.map(styleType => {
      const layerId = styleType.layer.id;
      if (layer[layerId]) {
        layer[layerId] = '';
        counter.detached++;
      } else {
        counter.ignored++;
      }
    });
  });
