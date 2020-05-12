import {
  Styler,
  generateAllLayerStyles,
  applyAllLayerStyles,
  detachAllLayerStyles,
  removeAllLayerStyles,
  removeLayerStylesByType,
} from './modules/styler';
import { cleanLayers } from './modules/utils/layers';
import { isArrayEmpty, figmaNotifyAndClose } from './modules/utils/common';

(function main() {
  figma.showUI(__html__, { visible: false });

  const CMD = figma.command;
  const TIMEOUT = 8000;

  // creating each style one by one
  const filler = new Styler({
    styleType: 'paint',
    styleProperties: ['paints'],
    layerProperties: ['fills'],
    layerPropertyType: 'fill',
    suffix: '-fill', // here it will be a variable in the future
  });
  const strokeer = new Styler({
    styleType: 'paint',
    styleProperties: ['paints'],
    layerProperties: ['strokes'],
    layerPropertyType: 'stroke',
    suffix: '-stroke', // here it will be a variable in the future
  });
  const effecter = new Styler({
    styleType: 'effect',
    styleProperties: ['effects'],
  });
  const grider = new Styler({
    styleType: 'grid',
    styleProperties: ['layoutGrids'],
  });
  const texter = new Styler({
    styleType: 'text',
    styleProperties: [
      'fontName',
      'fontSize',
      'letterSpacing',
      'lineHeight',
      'paragraphIndent',
      'paragraphSpacing',
      'textCase',
      'textDecoration',
    ],
  });

  const layers = cleanLayers(figma.currentPage.selection);
  const stylers = [filler, strokeer, effecter, grider, texter];

  // REMOVE THIS CONDITION AT THE END!!!!
  if (CMD === 'test') {
    let counter = 0;
    const allStyles = [
      ...figma.getLocalEffectStyles(),
      ...figma.getLocalPaintStyles(),
      ...figma.getLocalGridStyles(),
      ...figma.getLocalTextStyles(),
    ];
    allStyles.map((style) => {
      style.remove();
      counter++;
    });
    figmaNotifyAndClose(`🔥 Removed all ${counter} styles. Ups...`, TIMEOUT);
    return;
  }

  if (isArrayEmpty(layers)) {
    figmaNotifyAndClose(`🥰 You must select at least 1 layer.`, TIMEOUT);
    return;
  }

  // generate
  if (CMD === 'generate-styles') {
    generateAllLayerStyles(layers, stylers);
  }
  // apply
  else if (CMD === 'apply-styles') {
    applyAllLayerStyles(layers, stylers);
  }
  // detach
  else if (CMD === 'detach-styles') {
    detachAllLayerStyles(layers, stylers);
  }
  // remove
  else if (CMD === 'remove-styles') {
    removeAllLayerStyles(layers, stylers);
  }
  // remove by type
  else if (CMD.includes('remove')) {
    removeLayerStylesByType(layers, stylers, CMD);
  }

  // error
  else {
    figma.notify(`😬 Ups. Nothing happened...`);
  }
})();

// function customNotification(message, options = { timeout: 6000 }) {
//   figma.showUI(__html__, { width: 640, height: 400 });

//   figma.ui.postMessage(message);

//   // setTimeout(() => {
//   //   figma.ui.close();
//   //   figma.closePlugin();
//   // }, options.timeout);
// }

/* function main() {
  let figmaCommand = figma.command;
  const counter = {
    applied: 0,
    created: 0,
    detached: 0,
    extracted: 0,
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
      counter.extracted++;

      changeFillColor(textLayer, 1, 1, 1);
      await figma.loadFontAsync(style.fontName);
      textLayer.textStyleId = style.id;
      textLayer.characters = style.name;

      textContainer.appendChild(textLayer);
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
      return {
        name: name,
        styles: otherStyles.filter(style => style.name.match(name)),
      };
    });

    chunkArray(collectedStyles, 8).map(collectedStyles => {
      let rowContainer = figma.createFrame();
      rowContainer.name = 'Surfaces';
      changeFillColor(rowContainer, 0, 0, 0);
      setAutoFlowFrame(rowContainer, 'HORIZONTAL', 'MIN', 'AUTO', 24, 24, 24);
      mainContainer.appendChild(rowContainer);

      collectedStyles.map(collection => {
        let colContainer = figma.createFrame();
        colContainer.name = collection.name;

        // reset affix
        allTypes.fillType.affix.suffix = '';
        allTypes.strokeType.affix.suffix = '';

        collection.styles.map(style => {
          // this is a working code, but the approach is not ok
          // should refactor
          // check if there are fills and strokes
          if (collection.styles.filter(style => style.type === 'PAINT').length > 1) {
            allTypes.fillType.affix.suffix = '-fill';
            allTypes.strokeType.affix.suffix = '-stroke';

            if (style.name.match('-fill')) {
              colContainer.fillStyleId = style.id;
            } else if (style.name.match('-stroke')) {
              colContainer.strokeStyleId = style.id;
            }
          } else {
            if (style.type === 'PAINT') {
              colContainer.fillStyleId = style.id;
            }
          }
          if (style.type === 'EFFECT') {
            colContainer.effectStyleId = style.id;
          }
          if (style.type === 'GRID') {
            colContainer.gridStyleId = style.id;
          }
        });

        counter.extracted++;
        return rowContainer.appendChild(colContainer);
      });
    });

    figma.closePlugin(`✌️ Generated ${counter.extracted} layers.`);
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
 */
