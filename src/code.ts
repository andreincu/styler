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
import detachStyles from './actions/detachStyles';
import removeStyles from './actions/removeStyles';
import getStyleByName from './utils/getStyleByName';
import generate from './generate';
import applyStyle from './actions/applyStyle';

function main() {
  const selection = figma.currentPage.selection;

  const fillType = {
    type: 'PAINT',
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
    type: 'PAINT',
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
    type: 'EFFECT',
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
    type: 'GRID',
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
  const textType = {
    type: 'TEXT',
    style: {
      create: figma.createTextStyle,
      get: figma.getLocalTextStyles,
      prop: 'bypass',
      textProp: [
        'fontName',
        'fontSize',
        'letterSpacing',
        'lineHeight',
        'paragraphIndent',
        'paragraphSpacing',
        'textCase',
        'textDecoration'
      ]
    },
    layer: {
      id: 'textStyleId',
      prop: 'bypass',
      textProp: [
        'fontName',
        'fontSize',
        'letterSpacing',
        'lineHeight',
        'paragraphIndent',
        'paragraphSpacing',
        'textCase',
        'textDecoration'
      ]
    },
    affix: {
      prefix: '',
      suffix: ''
    }
  };

  let styleTypes = [];
  styleTypes.push(textType);
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
    removeStyles(counter);

    figma.closePlugin(
      ` 
      Removed ${counter.removed} styles. 🔥 
      (Tip: You can still undo the action)
      `
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
      generate(layers, styleTypes, counter);

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
      detachStyles(layers, styleTypes, counter);

      figma.closePlugin(`Detached ${counter.detached} styles. ✌️`);
      return;
    }

    // apply existing styles to layer
    else if (figma.command == 'applyStyles') {
      layers.map(layer => {
        styleTypes.map(styleType => {
          const layerProp = styleType.layer.prop;
          if (layer[layerProp].length > 0 || layerProp === 'bypass') {
            const styles = styleType.style.get();
            const nameMatch = getStyleByName(layer, styles, styleType);
            applyStyle(layer, nameMatch, styleType);
            counter.applied++;
          }
        });
      });

      figma.closePlugin(`Applied ${counter.applied} styles. ✌️`);
    }
  }
}
main();
