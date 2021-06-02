import { Config } from './Config';
import { CMD, counter } from './modules/globals';
import { messages } from './modules/messages';
import { showNofication } from './modules/notifications';
import { applyStyles, changeAllStyles, extractAllStyles, updateStyleNames } from './modules/styles';
import { DEFAULT_SETTINGS, loadSettingsAsync, saveSettingsAsync } from './settings';

async function main() {
  const cachedSettings = await loadSettingsAsync(DEFAULT_SETTINGS);

  let currentConfig = new Config(cachedSettings);
  const { notificationTimeout } = currentConfig;

  switch (CMD) {
    case 'clear-cache':
      await saveSettingsAsync(undefined);

      showNofication(0, messages(counter).clearCache, currentConfig.notificationTimeout);
      break;

    case 'extract-all-styles':
      extractAllStyles(currentConfig).then(() =>
        showNofication(counter.extracted, messages(counter).extracted, notificationTimeout),
      );
      break;

    case 'customize-plugin':
      figma.showUI(__html__, { width: 320, height: 424 });

      figma.ui.postMessage(cachedSettings);

      figma.ui.onmessage = async (msg) => {
        if (msg.type === 'cancel-modal') {
          showNofication(0, messages(counter).cancelSettings, notificationTimeout);
        }

        // save
        else if (msg.type === 'save-settings') {
          const newConfig = new Config(msg.uiSettings);

          updateStyleNames(currentConfig, newConfig);

          showNofication(
            counter.customize,
            messages(counter).customize,
            newConfig.notificationTimeout,
          );

          await saveSettingsAsync(msg.uiSettings);
        }
      };
      break;

    case 'apply-all-styles':
      applyStyles(currentConfig);
      break;

    default:
      changeAllStyles(currentConfig);
      break;
  }
}

main();
