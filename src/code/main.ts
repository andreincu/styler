import { clientStorageKey, Config } from './modules/config';
import { CMD, counter, messages, showNofication } from './modules/globals';
import { changeAllStyles, extractAllStyles, updateStyleNames } from './modules/styles';

let currentConfig;

figma.clientStorage.getAsync(clientStorageKey).then((cachedSettings) => {
  currentConfig = new Config(cachedSettings);
  const { notificationTimeout } = currentConfig;

  if (CMD === 'clear-cache') {
    figma.clientStorage.setAsync(clientStorageKey, undefined).then(() => {
      showNofication(0, messages(counter).clearCache, currentConfig.notificationTimeout);
    });
  }
  // creating layers based on styles
  else if (CMD === 'extract-all-styles') {
    extractAllStyles(currentConfig).then(() =>
      showNofication(counter.extracted, messages(counter).extracted, notificationTimeout),
    );
  }

  //
  else if (CMD === 'customize-plugin') {
    figma.showUI(__html__, { width: 360, height: 480 });

    figma.ui.postMessage(cachedSettings);

    figma.ui.onmessage = (msg) => {
      if (msg.type === 'cancel-modal') {
        showNofication(0, messages(counter).cancelSettings, notificationTimeout);
      }

      // save
      else if (msg.type === 'save-settings') {
        figma.clientStorage.setAsync(clientStorageKey, msg.uiSettings).then(() => {
          const newConfig = new Config(msg.uiSettings);

          updateStyleNames(currentConfig, newConfig);

          showNofication(counter.customize, messages(counter).customize, newConfig.notificationTimeout);
          return;
        });
      }
    };
  }

  //
  else {
    changeAllStyles(currentConfig);
  }
});
