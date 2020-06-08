import { clientStorageKey, Config } from './modules/config';
import { CMD } from './modules/globals';
import { changeAllStyles, extractAllStyles, updateStyleNames } from './modules/styles';

let currentConfig;

if (CMD === 'clear-cache') {
  figma.clientStorage.setAsync(clientStorageKey, undefined).then(() => {
    figma.closePlugin('🧹 Cleaned saved settings from cache.');
    return;
  });
}
//
else {
  figma.clientStorage.getAsync(clientStorageKey).then((cachedSettings) => {
    currentConfig = new Config(cachedSettings);

    // creating layers based on styles
    if (CMD === 'extract-all-styles') {
      extractAllStyles(currentConfig);
    }

    //
    else if (CMD === 'customize-plugin') {
      figma.showUI(__html__, { width: 360, height: 480 });
      figma.ui.postMessage(cachedSettings);
    }

    //
    else {
      changeAllStyles(currentConfig);
    }
  });

  figma.ui.onmessage = (msg) => {
    if (msg.type === 'cancel-modal') {
      figma.closePlugin('🥺 Everything is as before.');
      return;
    }

    // save
    else if (msg.type === 'save-settings') {
      figma.clientStorage.setAsync(clientStorageKey, msg.uiSettings).then(() => {
        let newConfig = new Config(msg.uiSettings);

        updateStyleNames(currentConfig, newConfig);
        figma.closePlugin();
        return;
      });
    }
  };
}
