import { clientStorageKey, Config } from './modules/config';
import { changeAllStyles, extractAllStyles, updateStyleNames } from './modules/styles';
import { CMD, counter } from './modules/globals';

let currentConfig;

figma.clientStorage.getAsync(clientStorageKey).then((codeSettings) => {
  currentConfig = new Config(codeSettings);

  // creating layers based on styles
  if (CMD === 'extract-all-styles') {
    extractAllStyles(currentConfig);
  } else if (CMD === 'customize-plugin') {
    figma.showUI(__html__, { width: 360, height: 480 });

    figma.ui.postMessage({ codeSettings });
  } else {
    changeAllStyles(currentConfig);
  }
});

figma.ui.onmessage = (msg) => {
  if (msg.type === 'save-settings') {
    figma.clientStorage.setAsync(clientStorageKey, msg.uiSettings).then(() => {
      const newConfig = new Config(msg.uiSettings);
      updateStyleNames(currentConfig, newConfig);
      figma.closePlugin();
    });
  }
};

console.log(counter);
