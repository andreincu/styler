import modifiedName from '../utils/modifiedName';

// sync layer style with shared style
export default (styles, layer, counter) => {
  styles.map(style => {
    if ((layer.fillStyleId = style.id)) {
      style.name = modifiedName('', layer, '-fill');
    } else if ((layer.strokeStyleId = style.id)) {
      style.name = modifiedName('', layer, '-stroke');
    } else if ((layer.textStyleId = style.id)) {
      style.name = modifiedName('', layer, '');
    } else if ((layer.effectStyleId = style.id)) {
      style.name = modifiedName('', layer, '');
    } else if ((layer.gridStyleId = style.id)) {
      style.name = modifiedName('', layer, '');
    }
    counter.renamed++;
  });
};
