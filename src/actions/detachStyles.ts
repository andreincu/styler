export default (layers, counter) =>
  layers.map(layer => {
    const ids = [
      'fillStyleId',
      'strokeStyleId',
      'textStyleId',
      'gridStyleId',
      'effectStyleId'
    ];

    ids.map(id => (layer[id] ? (layer[id] = '') : null));
    counter.detached++;
  });
