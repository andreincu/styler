import { CMD, clientStorageKey, changeGlobals } from './js-modules/globals';
import { changeAllStyles, extractAllStyles } from './js-modules/styles';

figma.showUI(__html__, { visible: false });

// getting local stored settings and updating the globals
figma.clientStorage.getAsync(clientStorageKey).then((codeSettings) => {
  if (CMD === 'customize-plugin') {
    figma.showUI(__html__, { width: 480, height: 500 });

    figma.ui.postMessage({ codeSettings });
  }

  changeGlobals(codeSettings);

  // creating layers based on styles
  if (CMD === 'extract-all-styles') {
    extractAllStyles();
  } else {
    changeAllStyles();
  }
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'save-settings') {
    figma.clientStorage.setAsync(clientStorageKey, msg.uiSettings).then(() => {
      figma.closePlugin();
    });
  }
};
