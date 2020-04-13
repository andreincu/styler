/* 
There are 4 main scenarios:
1. layer-name = style-name (linked) => matched (Apply style)
2. layer-name = style-name (detached) => update style properties (for example colors) from layer properties
3. layer-name != style-name (linked) => (renamed) update style name to layer
4. layer-name != style-name (detached) => (create) create style using layer name and properties 

Known issues:
- Figma limitations:
--- For the moment, figma api doesn't provide any method to sort styles
--- Styles that inherit a layer name that begins with "_" (underscore) or "." (dot) doesn't get unpublish status

TODO:
- add pefix / suffix for fill vs stroke
- save all styles locally
- check if layer is visible (ignore it )

 */

import applyStyle from './actions/applyStyle';
import detachStyle from './actions/detachStyle';
import generateStyle from './actions/generateStyle';
import removeStyle from './actions/removeStyle';

import getStyleById from './utils/getStyleById';
import getStyleByName from './utils/getStyleByName';
import cleanLayers from './utils/cleanLayers';
import setCanvasBg from './actions/setCanvasBg';
import clone from './utils/clone';
import changeFillColor from './utils/changeFillColor';
import setAutoFlowFrame from './utils/setAutoFlowFrame';

function main() {
  let figmaCommand = figma.command;
  const counter = {
    applied: 0,
    created: 0,
    detached: 0,
    ignored: 0,
    renamed: 0,
    removed: 0,
    updated: 0,
  };
  const allTypes = {
    fillType: {
      type: 'FILL',
      style: {
        create: figma.createPaintStyle,
        get: figma.getLocalPaintStyles,
        prop: 'paints',
      },
      layer: {
        prop: 'fills',
        id: 'fillStyleId',
      },
      affix: {
        prefix: '',
        suffix: '',
      },
    },
    strokeType: {
      type: 'STROKE',
      style: {
        create: figma.createPaintStyle,
        get: figma.getLocalPaintStyles,
        prop: 'paints',
      },
      layer: {
        prop: 'strokes',
        id: 'strokeStyleId',
      },
      affix: {
        prefix: '',
        suffix: '',
      },
    },
    effectType: {
      type: 'EFFECT',
      style: {
        create: figma.createEffectStyle,
        get: figma.getLocalEffectStyles,
        prop: 'effects',
      },
      layer: {
        prop: 'effects',
        id: 'effectStyleId',
      },
      affix: {
        prefix: '',
        suffix: '',
      },
    },
    gridType: {
      type: 'GRID',
      style: {
        create: figma.createGridStyle,
        get: figma.getLocalGridStyles,
        prop: 'layoutGrids',
      },
      layer: {
        prop: 'layoutGrids',
        id: 'gridStyleId',
      },
      affix: {
        prefix: '',
        suffix: '',
      },
    },
    textType: {
      type: 'TEXT',
      style: {
        create: figma.createTextStyle,
        get: figma.getLocalTextStyles,
        prop: 'fontName',
        textProp: [
          'fontSize',
          'letterSpacing',
          'lineHeight',
          'paragraphIndent',
          'paragraphSpacing',
          'textCase',
          'textDecoration',
        ],
      },
      layer: {
        id: 'textStyleId',
        prop: 'fontName',
        textProp: [
          'fontSize',
          'letterSpacing',
          'lineHeight',
          'paragraphIndent',
          'paragraphSpacing',
          'textCase',
          'textDecoration',
        ],
      },
      affix: {
        prefix: '',
        suffix: '',
      },
    },
  };

  // generate layers with the styles applied to them (a styleguide)
  if (figmaCommand === 'extractStyles') {
    let mainContainer = figma.createFrame();
    mainContainer.name = 'Container';
    changeFillColor(mainContainer, 0, 0, 0);
    setAutoFlowFrame(mainContainer, 'VERTICAL', 'MIN', 'AUTO', 24, 24, 24);

    let textContainer = figma.createFrame();
    textContainer.name = 'Typography';
    changeFillColor(textContainer, 0, 0, 0);
    setAutoFlowFrame(textContainer, 'VERTICAL', 'MIN', 'AUTO', 24, 24, 24);
    mainContainer.appendChild(textContainer);

    figma.getLocalTextStyles().map(async style => {
      let textLayer = figma.createText();

      changeFillColor(textLayer, 1, 1, 1);
      await figma.loadFontAsync(style.fontName);
      textLayer.textStyleId = style.id;
      textLayer.characters = style.name;

      return textContainer.appendChild(textLayer);
    });

    const otherStyles = [
      ...figma.getLocalPaintStyles(),
      ...figma.getLocalEffectStyles(),
      ...figma.getLocalGridStyles(),
    ];
    const curatedNames = otherStyles.map(style => {
      const affixes = ['-fill', '-stroke'];
      const regex = new RegExp('\\b(?:' + affixes.join('|') + ')\\b', 'g');

      return style.name.replace(regex, '');
    });
    const uniqueNames = [...new Set(curatedNames)];

    const collectedStyles = uniqueNames.map(name => {
      const styles = otherStyles.filter(style => style.name.match(name));
      return {
        name: name,
        styles: styles,
      };
    });
    console.log(collectedStyles);
    debugger;

    let surfaceContainer = figma.createFrame();
    surfaceContainer.name = 'Surfaces';
    changeFillColor(surfaceContainer, 0, 0, 0);
    setAutoFlowFrame(surfaceContainer, 'HORIZONTAL', 'MIN', 'AUTO', 24, 24, 24);
    mainContainer.appendChild(surfaceContainer);

    collectedStyles.map(collection => {
      let layer = figma.createFrame();
      layer.name = collection.name;

      // reset affix
      allTypes.fillType.affix.suffix = '';
      allTypes.strokeType.affix.suffix = '';
      // check if there are fills and strokes
      if (collection.styles.filter(style => style.type === 'PAINT').length > 1) {
        allTypes.fillType.affix.suffix = '-fill';
        allTypes.strokeType.affix.suffix = '-stroke';
      }

      collection.styles.map(style => {
        const test = Object.values(allTypes);
        // .filter(
        //   type => type.style.prop.toLocaleLowerCase() === style.type.toLocaleLowerCase(),
        // );

        // .map(type => applyStyle(layer, style, type));

        return test;
      });

      return surfaceContainer.appendChild(layer);
    });

    figma.closePlugin(`ending`);
    return;
  }

  // checking selection
  const selection = figma.currentPage.selection;
  if (selection && selection.length <= 0) {
    figma.closePlugin('No layers is selected, please select at least one layer. 🌟');
    return;
  }

  // main features here
  const layers = cleanLayers(selection);
  counter.ignored = selection.length - layers.length;
  layers.map(layer => {
    // reset affix
    allTypes.fillType.affix.suffix = '';
    allTypes.strokeType.affix.suffix = '';

    let styleTypes = [];
    if (layer.type === 'TEXT') {
      styleTypes.push(allTypes.textType);
    } else {
      // checking if layer has both fill and stroke properties
      if (layer.fills && layer.fills.length && layer.strokes && layer.strokes.length) {
        allTypes.fillType.affix.suffix = '-fill';
        allTypes.strokeType.affix.suffix = '-stroke';
      }
      styleTypes.push(allTypes.fillType);
      styleTypes.push(allTypes.strokeType);
      styleTypes.push(allTypes.effectType);
      styleTypes.push(allTypes.gridType);
    }

    styleTypes.map(styleType => {
      const styles = styleType.style.get();
      const layerProp = layer[styleType.layer.prop];
      const idMatch = getStyleById(layer, styles, styleType);
      const nameMatch = getStyleByName(layer, styles, styleType);

      if ((layerProp && layerProp.length) || styleType.type === 'TEXT') {
        switch (figmaCommand) {
          case 'generateStyles':
            generateStyle(layer, idMatch, nameMatch, styleType, counter);
            break;
          case 'applyStyles':
            applyStyle(layer, nameMatch, styleType);
            counter.applied++;
            break;
          case 'detachStyles':
            detachStyle(layer, styleType);
            counter.detached++;
            break;
          case 'removeStyles':
            removeStyle(idMatch, styleType, 'removeFillStyles', counter);
            removeStyle(idMatch, styleType, 'removeStrokeStyles', counter);
            removeStyle(idMatch, styleType, 'removeTextStyles', counter);
            removeStyle(idMatch, styleType, 'removeEffectStyles', counter);
            removeStyle(idMatch, styleType, 'removeGridStyles', counter);
            break;
          case 'removeFillStyles':
          case 'removeStrokeStyles':
          case 'removeTextStyles':
          case 'removeEffectStyles':
          case 'removeGridStyles':
            removeStyle(idMatch, styleType, figmaCommand, counter);
            break;
          default:
            figma.closePlugin('😬 Something bad happened. Actually, nothing is changed.');
            return;
        }
      }
    });
  });

  switch (figmaCommand) {
    case 'generateStyles':
      figma.closePlugin(`
          Statistics:\n
          - Created: ${counter.created}\n
          - Updated: ${counter.updated}\n
          - Renamed: ${counter.renamed}\n
          - Ignored: ${counter.ignored}
          `);
      break;
    case 'applyStyles':
      figma.closePlugin(`✌️ Applied ${counter.applied} styles.`);
      break;
    case 'detachStyles':
      figma.closePlugin(`💔 Detached ${counter.detached} styles.`);
      break;
    case 'removeStyles':
    case 'removeFillStyles':
    case 'removeStrokeStyles':
    case 'removeTextStyles':
    case 'removeEffectStyles':
    case 'removeGridStyles':
      {
        if (counter.removed != 0) {
          figma.closePlugin(`🔥 Removed ${counter.removed} styles. (Tip: You can still undo the action)`);
          return;
        } else {
          figma.closePlugin(`ℹ️ There is no style attached to the layer...`);
        }
      }
      break;
  }
}
main();
