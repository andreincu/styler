import { NOTIFICATION_TIMEOUT, CMD } from './scripts/modules/globals';
import { figmaNotifyAndClose } from './scripts/modules/utils';
import {
  // generateAllLayerStyles,
  // applyAllLayerStyles,
  // detachAllLayerStyles,
  // removeAllLayerStyles,
  // removeLayerStylesByType,
  extractAllStyles,
  changeStyles,
} from './scripts/modules/styler';

(function main() {
  figma.showUI(__html__, { visible: false });

  // REMOVE THIS CONDITION AT THE END!!!!
  if (CMD === 'test') {
    // console.log(temp);
    // debugger;

    // createFrameLayer();
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
    figmaNotifyAndClose(`🔥 Removed all`, NOTIFICATION_TIMEOUT);
    return;
  }
  // REMOVE THIS CONDITION AT THE END!!!!
  if (CMD === 'extract-styles') {
    extractAllStyles();
    return;
  }

  /* // generate
  if (CMD === 'generate-styles') {
    generateAllLayerStyles(selection);
  }
  // apply
  else if (CMD === 'apply-styles') {
    applyAllLayerStyles(selection);
  }
  // detach
  else if (CMD === 'detach-styles') {
    detachAllLayerStyles(selection);
  }
  // remove
  else if (CMD === 'remove-styles') {
    removeAllLayerStyles(selection);
  } */
  // // remove by type
  // else if (CMD.includes('remove')) {
  //   removeLayerStylesByType(selection);
  // }

  // error
  else {
    changeStyles();

    figma.closePlugin();
  }
})();
