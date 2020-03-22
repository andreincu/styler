import getStyleById from './utils/getStyleById';
import getStyleByName from './utils/getStyleByName';
import renameStyles from './actions/renameStyles';
import updateStyle from './actions/updateStyle';
import checkLayerFills from './utils/checkLayerFills';
import checkLayerStrokes from './utils/checkLayerStrokes';
import createFillStyle from './actions/createFillStyle';
import createStrokeStyle from './actions/createStrokeStyle';
import checkLayerEffects from './utils/checkLayerEffects';
import createEffectStyle from './actions/createEffectStyle';

export default (layers, styles, counter) =>
  layers.map(layer => {
    const idMatch = getStyleById(layer);
    const nameMatch = getStyleByName(layer, styles);

    // create style from layer
    if (idMatch.length <= 0 && nameMatch.length <= 0) {
      if (checkLayerFills(layer)) {
        createFillStyle(layer);
        counter.created++;
      }
      if (checkLayerStrokes(layer)) {
        createStrokeStyle(layer);
        counter.created++;
      }
      if (checkLayerEffects(layer)) {
        createEffectStyle(layer);
        counter.created++;
      }
    }

    // rename style from layer
    else if (idMatch && !nameMatch) {
      renameStyles(idMatch, layer, counter);
    }

    // update style properties from layer and apply to layer
    else if (!idMatch && nameMatch) {
      updateStyle(nameMatch, layer);
      counter.updated++;
    }

    //
    else {
      counter.ignored++;
    }
  });
