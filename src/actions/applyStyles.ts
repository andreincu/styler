import modifiedName from '../utils/modifiedName';

// sync layer style with shared style
export default (layer, styles, counter) => {
  styles.map(style => {
    if (style.name === modifiedName('', layer, '-fill')) {
      layer.fillStyleId = style.id;
    }
    //
    if (style.name === modifiedName('', layer, '-stroke')) {
      layer.strokeStyleId = style.id;
    }
    //
    if (style.name === modifiedName('', layer, '')) {
      layer.effectStyleId = style.id;
      layer.gridStyleId = style.id;
    }
    counter.applied++;
  });
};
