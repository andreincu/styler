import { cleanLayers, hasFillAndStroke } from './modules/layer-utils';
import Styler from './modules/Styler';

(function main() {
  const figmaCommand = figma.command;

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

  // creating each style one by one
  const filler = new Styler({
    styleType: 'paint',
    styleProperties: ['paints'],
    layerProperties: ['fills'],
    layerPropertyType: 'fill',
  });
  const strokeer = new Styler({
    styleType: 'paint',
    styleProperties: ['paints'],
    layerProperties: ['strokes'],
    layerPropertyType: 'stroke',
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

  const selectedLayers = figma.currentPage.selection;
  const curatedLayers = cleanLayers(selectedLayers);
  const allStyles = [
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
    ...figma.getLocalGridStyles(),
    ...figma.getLocalTextStyles(),
  ];

  curatedLayers.map((layer, index) => {
    // stylers are the links between layers and styles that are created by figma code inconsistency or design decision itself (which are not bad and simply exist)
    const stylers = [];

    // keeping this approach, until I found a better way to handle text layers
    if (layer.type === 'TEXT') {
      stylers.push(texter);
    } else {
      stylers.push(filler, strokeer, effecter, grider);
    }

    filler.suffix = '';
    strokeer.suffix = '';

    if (hasFillAndStroke(layer)) {
      filler.suffix = '-fill';
      strokeer.suffix = '-stroke';
    }

    stylers.map((styler) => {
      if (styler.isPropEmpty(layer) || styler.isPropMixed(layer)) {
        return counter.ignored++;
      }

      const idMatch = styler.getStyleById(layer);
      const nameMatch = styler.getStyleByName(layer);

      switch (figmaCommand) {
        case 'generateStyles':
          styler.generateStyle(layer, idMatch, nameMatch, counter);
          break;

        case 'applyStyles':
          styler.applyStyle(layer, nameMatch);
          counter.applied++;
          break;

        case 'detachStyles':
          styler.detachStyle(layer);
          counter.detached++;
          break;

        case 'removeStyles':
          ['removeFillStyles', 'removeStrokeStyles', 'removeTextStyles', 'removeEffectStyles', 'removeGridStyles'].map(
            (command) => {
              styler.removeStyle(idMatch, command, counter);
            },
          );
          break;

        case 'removeFillStyles':
        case 'removeStrokeStyles':
        case 'removeTextStyles':
        case 'removeEffectStyles':
        case 'removeGridStyles':
          styler.removeStyle(idMatch, figmaCommand);
          counter.removed++;
          break;

        default:
          figma.notify('😬 Something bad happened. Actually, nothing is changed.');
          break;
      }
    });
  });

  const TIMEOUT = { timeout: 8000 };
  switch (figmaCommand) {
    case 'generateStyles':
      figma.showUI(__html__, { width: 400, height: 400 });
      figma.ui.postMessage(counter);

      setTimeout(() => {
        figma.ui.close();
        figma.closePlugin();
      }, TIMEOUT.timeout);
      break;

    case 'applyStyles':
      figma.notify(`✌️ Applied ${counter.applied} styles.`, TIMEOUT);
      break;

    case 'detachStyles':
      figma.notify(`💔 Detached ${counter.detached} styles.`, TIMEOUT);
      break;

    case 'removeStyles':
    case 'removeFillStyles':
    case 'removeStrokeStyles':
    case 'removeTextStyles':
    case 'removeEffectStyles':
    case 'removeGridStyles':
      {
        if (counter.removed != 0) {
          figma.notify(`🔥 Removed ${counter.removed} styles. (Tip: You can still undo the action)`, TIMEOUT);
        } else {
          figma.notify(`ℹ There is no style attached to the layer...`, TIMEOUT);
        }
      }
      break;
  }

  figma.closePlugin();
})();

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
