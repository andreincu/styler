/* 
There are 4 main scenarios:
1. layer-name = style-name (linked) => matched (Apply style)
2. layer-name = style-name (detached) => update style properties (for example colors) from layer properties
3. layer-name != style-name (linked) => (renamed) update style name to layer
4. layer-name != style-name (detached) => (create) create style using layer name and properties 

Brainstorming:
- 

Known issues:
- Figma limitations:
--- For the moment, figma api doesn't provide any method to sort styles
--- Styles that inherit a layer name that begins with "_" (underscore) or "." (dot) doesn't get unpublish status

TODO:
- add pefix / suffix for fill vs stroke
- save all styles locally
- check if layer is visible (ignore it )

 */

import cleanLayers from './utils/cleanLayers';
import cleanStyles from './utils/cleanStyles';

import applyStyles from './actions/applyStyles';
import detachStyles from './actions/detachStyles';
import removeStyles from './actions/removeStyles';
import generate from './generate';

function main() {
  const selection = figma.currentPage.selection;
  const styles = cleanStyles();
  const counter = {
    applied: 0,
    created: 0,
    updated: 0,
    renamed: 0,
    removed: 0,
    detached: 0,
    ignored: 0
  };

  // remove all styles, be very carefull!!!
  if (figma.command === 'removeStyles') {
    removeStyles(styles, counter);

    figma.closePlugin(
      ` Removed ${counter.removed} styles. 🔥 (Tip: You can still undo the action)`
    );
    return;
  }

  // checking selection
  else if (selection && selection.length <= 0) {
    figma.closePlugin(
      'No layers is selected, please select at least one layer. 🌟'
    );
    return;
  }

  // main features here
  else {
    let layers = cleanLayers(selection);
    counter.ignored = selection.length - layers.length;

    // create, update, rename styles based of selected layers
    if (figma.command === 'generate') {
      generate(layers, styles, counter);
      figma.closePlugin(`
        Statistics:\n
        - Created: ${counter.created}\n
        - Updated: ${counter.updated}\n
        - Renamed: ${counter.renamed}\n
        - Ignored: ${counter.ignored}
        `);
      return;
    }

    // detach styles
    else if (figma.command === 'detachStyles') {
      detachStyles(layers, counter);
      figma.closePlugin(`Detached ${counter.detached} layers. ✌️`);
      return;
    }

    // apply existing styles to layer
    else if (figma.command == 'apply') {
      layers.map(layer => applyStyles(layer, styles, counter));
      figma.closePlugin(`Applied ${counter.applied} styles. ✌️`);
      return;
    }
  }
}
main();
