import { NOTIFICATION_TIMEOUT, CMD } from './scripts/modules/globals';
import { figmaNotifyAndClose, isArrayEmpty } from './scripts/modules/utils';
import { extractAllStyles, showStyleNofication, getStylersByLayerType } from './scripts/modules/styler';
import { cleanSelection } from './scripts/modules/layers';

(function main() {
  figma.showUI(__html__, { visible: false });

  // creating layers based on styles
  if (CMD === 'extract-all-styles') {
    extractAllStyles();
  }

  // changing styles based on layer selection
  else {
    const selection = cleanSelection();

    if (isArrayEmpty(selection)) {
      figmaNotifyAndClose(`🥰 You must select at least 1 layer. Yea...`, NOTIFICATION_TIMEOUT);
      return;
    }

    selection.map((layer) => {
      const stylers = getStylersByLayerType(layer);

      stylers.map(async (styler) => {
        if (layer.type === 'TEXT') {
          await figma.loadFontAsync(layer.fontName as FontName);
        }

        const idMatch = styler.getStyleById(layer);
        const nameMatch = styler.getStyleByName(layer.name);

        if (CMD === 'generate-all-styles') {
          styler.generateStyle(layer, { nameMatch, idMatch });
        } else if (CMD === 'apply-all-styles') {
          styler.applyStyle(layer, nameMatch);
        } else if (CMD === 'detach-all-styles') {
          styler.detachStyle(layer);
        } else if (CMD.includes('remove')) {
          styler.removeStyle(idMatch);
        }
      });
    });

    showStyleNofication();
  }
})();
