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

import applyStyles from './actions/applyStyle';
import detachStyles from './actions/detachStyles';
import removeStyles from './actions/removeStyles';
import generate from './generate';

function main() {
  const selection = figma.currentPage.selection;

  const fillType = {
    style: {
      create: figma.createPaintStyle,
      get: figma.getLocalPaintStyles,
      prop: 'paints'
    },
    layer: {
      prop: 'fills',
      id: 'fillStyleId'
    },
    affix: {
      prefix: '',
      suffix: '-fill'
    }
  };
  const strokeType = {
    style: {
      create: figma.createPaintStyle,
      get: figma.getLocalPaintStyles,
      prop: 'paints'
    },
    layer: {
      prop: 'strokes',
      id: 'strokeStyleId'
    },
    affix: {
      prefix: '',
      suffix: '-stroke'
    }
  };
  const effectType = {
    style: {
      create: figma.createEffectStyle,
      get: figma.getLocalEffectStyles,
      prop: 'effects'
    },
    layer: {
      prop: 'effects',
      id: 'effectStyleId'
    },
    affix: {
      prefix: '',
      suffix: ''
    }
  };
  const gridType = {
    style: {
      create: figma.createGridStyle,
      get: figma.getLocalGridStyles,
      prop: 'layoutGrids'
    },
    layer: {
      prop: 'layoutGrids',
      id: 'gridStyleId'
    },
    affix: {
      prefix: '',
      suffix: ''
    }
  };

  let styleTypes = [];
  styleTypes.push(fillType);
  styleTypes.push(strokeType);
  styleTypes.push(effectType);
  styleTypes.push(gridType);
  const counter = {
    applied: 0,
    created: 0,
    detached: 0,
    ignored: 0,
    renamed: 0,
    removed: 0,
    updated: 0
  };

  // remove all styles, be very carefull!!!
  if (figma.command === 'removeStyles') {
    removeStyles(styleTypes, counter);

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
    const layers = cleanLayers(selection);
    counter.ignored = selection.length - layers.length;

    // create, update, rename styles based of selected layers
    if (figma.command === 'generate') {
      styleTypes.map(styleType => {
        generate(layers, styleType, counter);
      });

      figma.closePlugin(`
        Statistics:\n
        - Created: ${counter.created}\n
        - Updated: ${counter.updated}\n
        - Renamed: ${counter.renamed}\n
        - Ignored: ${counter.ignored}
        `);
    }

    // detach styles
    else if (figma.command === 'detachStyles') {
      styleTypes.map(styleType => {
        detachStyles(layers, styleType, counter);
      });
      figma.closePlugin(`Detached ${counter.detached} styles. ✌️`);
      return;
    }

    /* // apply existing styles to layer
    else if (figma.command == 'applyStyles') {
      layers.map(layer => {
        styles.map(style => {
          applyStyles(layer, style, styleTypes);
          counter.applied++;
        });
      });

      figma.closePlugin(`Applied ${counter.applied} styles. ✌️`);
    } */
  }
}
main();
