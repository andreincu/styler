// there are 4 main scenarios
// ** DONE ** layer-name = style-name (linked) => matched (Apply style)
// ** DONE ** layer-name = style-name (detached) => update style properties (for example colors) from layer properties
// ** DONE ** layer-name != style-name (linked) => (renamed) update style name to layer
// ** DONE ** layer-name != style-name (detached) => (create) create style using layer name and properties

// import clone from './utils/clone';
import getAllStyles from './utils/getAllStyles';
import getStyleById from './utils/getStyleById';
import getStyleByName from './utils/getStyleByName';

import createStyle from './actions/createStyle';
import applyStyle from './actions/applyStyle';
import renameStyle from './actions/renameStyle';
import updateStyle from './actions/updateStyle';
import detachStyle from './actions/detachStyle';

const layers = figma.currentPage.selection;
const styles = getAllStyles();

if (figma.command == 'generate') {
  const counter = {
    created: 0,
    updated: 0,
    renamed: 0,
    ignored: 0
  };

  for (let layer of layers) {
    const idMatch = figma.getStyleById(layer.fillStyleId);
    const nameMatch = getStyleByName(styles, layer);

    if (!idMatch && nameMatch) {
      updateStyle(nameMatch, layer);
      applyStyle(nameMatch, layer);
      counter.updated++;
    } else if (idMatch && !nameMatch) {
      renameStyle(idMatch, layer);
      counter.renamed++;
    } else if (!idMatch && !nameMatch) {
      createStyle(layer);
      counter.created++;
    } else {
      counter.ignored++;
    }
  }
  figma.notify(
    `
    Statistics:\n
    - Created: ${counter.created}\n
    - Updated: ${counter.updated}\n
    - Renamed: ${counter.renamed}\n
    - Ignored: ${counter.ignored}
    `
  );

  figma.closePlugin();
}

// detach styles
else if (figma.command == 'detach') {
  for (let layer of layers) {
    detachStyle(layer);
  }

  figma.closePlugin();
}

// remove all styles, be very carefull!!!
else if (figma.command == 'removeAllStyles') {
  for (let style of styles) {
    style.remove();
  }

  figma.closePlugin();
}

// apply existing styles to layer
else if (figma.command == 'apply') {
  for (let layer of layers) {
    const nameMatch = getStyleByName(styles, layer);
    applyStyle(nameMatch, layer);
  }

  figma.closePlugin();
}
