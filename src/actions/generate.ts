import createStyle from './createStyle';
import renameStyle from './renameStyle';
import updateStyle from './updateStyle';

export default (layer, idMatch, nameMatch, styleType, counter) => {
  // create, update, rename styles based of selected layers
  if (!idMatch && !nameMatch) {
    createStyle(layer, styleType);
    counter.created++;
  }

  // rename style from layer
  else if (idMatch && !nameMatch) {
    renameStyle(layer, idMatch, styleType);
    counter.renamed++;
  }

  // update style properties from layer and apply to layer
  else if (!idMatch && nameMatch) {
    updateStyle(layer, nameMatch, styleType);
    counter.updated++;
  }

  //
  else {
    counter.ignored++;
  }
};
