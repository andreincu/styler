import { clientStorageKey, Config, updateStyleNames } from './modules/config';
import { changeAllStyles, extractAllStyles } from './modules/styles';

export const CMD = figma.command;
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
      updateStyleNames(currentConfig, msg.uiSettings);
      figma.closePlugin();
    });
  }
};
