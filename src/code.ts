import { stylers, TIMEOUT, CMD } from './scripts/modules/globals';
import { cleanLayers, createFrameLayer } from './scripts/modules/layers';
import { isArrayEmpty, figmaNotifyAndClose } from './scripts/modules/utils';
import {
  generateAllLayerStyles,
  applyAllLayerStyles,
  detachAllLayerStyles,
  removeAllLayerStyles,
  removeLayerStylesByType,
  extractAllStyles,
} from './scripts/modules/styler';

(function main() {
  figma.showUI(__html__, { visible: false });

  const layers = cleanLayers(figma.currentPage.selection);

  // REMOVE THIS CONDITION AT THE END!!!!
  if (CMD === 'test') {
    createFrameLayer({});
    // let counter = 0;
    // const allStyles = [
    //   ...figma.getLocalEffectStyles(),
    //   ...figma.getLocalPaintStyles(),
    //   ...figma.getLocalGridStyles(),
    //   ...figma.getLocalTextStyles(),
    // ];
    // allStyles.map((style) => {
    //   style.remove();
    //   counter++;
    // });
    figmaNotifyAndClose(`🔥 Removed all`, TIMEOUT);
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
