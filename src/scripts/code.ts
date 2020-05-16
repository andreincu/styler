import { stylers, TIMEOUT } from './modules/utils/globals';
import { cleanLayers } from './modules/utils/layers';
import { isArrayEmpty, figmaNotifyAndClose } from './modules/utils/common';
import {
  generateAllLayerStyles,
  applyAllLayerStyles,
  detachAllLayerStyles,
  removeAllLayerStyles,
  removeLayerStylesByType,
  extractAllStyles,
} from './modules/styler';

(function main() {
  figma.showUI(__html__, { visible: false });

  const CMD = figma.command;

  const layers = cleanLayers(figma.currentPage.selection);

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
  // REMOVE THIS CONDITION AT THE END!!!!
  if (CMD === 'extract-styles') {
    extractAllStyles(stylers);
    return;
  }

  if (isArrayEmpty(layers)) {
    figmaNotifyAndClose(`🥰 You must select at least 1 layer. Yea...`, TIMEOUT);
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

  }
}
main();
 */
