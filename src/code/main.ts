import { changeGlobals, clientStorageKey, CMD, allStylers } from './modules/globals';
import { changeAllStyles, extractAllStyles } from './modules/styles';

figma.showUI(__html__, { visible: false });

// getting local stored settings and updating the globals
figma.clientStorage.getAsync(clientStorageKey).then((codeSettings) => {
  changeGlobals(codeSettings);

  // creating layers based on styles
  if (CMD === 'extract-all-styles') {
    extractAllStyles();
  } else if (CMD === 'customize-plugin') {
    figma.showUI(__html__, { width: 360, height: 480 });

    figma.ui.postMessage({ codeSettings });
  } else {
    changeAllStyles();
  }
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'save-settings') {
    figma.clientStorage.setAsync(clientStorageKey, msg.uiSettings).then(() => {
      allStylers.map((styler) => styler.updateAffixesFromUI(msg.uiSettings));
      figma.closePlugin();
    });
  }
};
