import getStyleById from './utils/getStyleById';
import getStyleByName from './utils/getStyleByName';
import createStyle from './actions/createStyle';
import renameStyle from './actions/renameStyle';
import updateStyle from './actions/updateStyle';
import applyStyle from './actions/applyStyle';

export default (layers, styleType, counter) => {
  const styles = styleType.style.get();
  layers.map(layer => {
    const layerProp = styleType.layer.prop;

    if (layer[layerProp] && layer[layerProp].length > 0) {
      const idMatch = getStyleById(layer, styles, styleType);
      const nameMatch = getStyleByName(layer, styles, styleType);

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
        applyStyle(layer, nameMatch, styleType);
        counter.updated++;
      }
    }
  });
};

/* 
    //
    else {
      counter.ignored++;
    } 
*/
