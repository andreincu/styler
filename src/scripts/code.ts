import { CMD, key, getGlobalsFromUI, notificationTimeout, filler } from './modules/globals';
import { changeAllStyles, extractAllStyles } from './modules/styles';
import { figmaNotifyAndClose } from './modules/utils';

(function main() {
  figma.showUI(__html__, { visible: false });

  figma.clientStorage.getAsync(key).then((settings) => {
    getGlobalsFromUI(settings);

    // creating layers based on styles
    if (CMD === 'extract-all-styles') {
      extractAllStyles();
    } else {
      changeAllStyles();
    }
  });

  if (CMD === 'customize-plugin') {
    figma.showUI(__html__, { width: 520, height: 500 });

    figma.ui.onmessage = (msg) => {
      figma.clientStorage.getAsync(key).then((settings) => {
        figma.ui.postMessage({ settings });
        figma.closePlugin();
      });
    };
  }

  figma.ui.onmessage = (msg) => {
    if (msg.type === 'save') {
      figma.clientStorage.setAsync(key, msg.uiSettings).then(() => {
        getGlobalsFromUI(msg.uiSettings);
        figmaNotifyAndClose(`✌ Settings were saved.`, notificationTimeout);
      });
    }
  };
})();
