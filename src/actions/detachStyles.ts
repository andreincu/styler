export default (layers, styleType, counter) =>
  layers.map(layer => {
    const layerId = styleType.layer.id;
    layer[layerId] ? (layer[layerId] = '') : null;

    counter.detached++;
  });
