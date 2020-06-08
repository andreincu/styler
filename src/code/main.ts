import { clientStorageKey, Config } from './modules/config';
import { changeAllStyles, extractAllStyles, updateStyleNames } from './modules/styles';
import { CMD, counter } from './modules/globals';

let currentConfig;

if (CMD === 'clear-cache') {
  figma.clientStorage.setAsync(clientStorageKey, undefined).then(() => {
    figma.closePlugin('🧹 Restored to default');
    return;
  });
} else {
  figma.clientStorage.getAsync(clientStorageKey).then((cachedSettings) => {
    // console.log('cached one:');
    // console.log(cachedSettings);
    currentConfig = new Config(cachedSettings);

    // creating layers based on styles
    if (CMD === 'extract-all-styles') {
      // extractAllStyles(currentConfig);
    } else if (CMD === 'customize-plugin') {
      figma.showUI(__html__, { width: 360, height: 480 });

      figma.ui.postMessage(cachedSettings);
    } else {
      changeAllStyles(currentConfig);
    }
  });

  figma.ui.onmessage = (msg) => {
    // console.log('in code msg');
    // console.log(msg);

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
