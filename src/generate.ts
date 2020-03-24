import createStyle from './actions/createStyle';
import renameStyle from './actions/renameStyle';
import updateStyle from './actions/updateStyle';
import applyStyle from './actions/applyStyle';

import getStyleById from './utils/getStyleById';
import getStyleByName from './utils/getStyleByName';

export default (layers, styleTypes, counter) => {
  layers.map(layer => {
    styleTypes.map(styleType => {
      const styles = styleType.style.get();
      const layerProperty = styleType.layer.prop;

      if (
        layerProperty === 'bypass' ||
        (layer[layerProperty] && layer[layerProperty].length > 0)
      ) {
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
          counter.updated++;
        }
        //
        else {
          counter.ignored++;
        }
      }
    });
  });
};
