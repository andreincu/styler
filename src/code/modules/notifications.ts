import { defaultSettings } from '../settings';
import { counter } from './globals';
import { messages } from './messages';

export const showNofication = (counter = 0, messages, timeout = 7000) => {
  const { verySpecial = '', special = '', empty = '', single = '', multiple = '' } = messages;

  switch (counter) {
    case -2:
      figma.notify(verySpecial, { timeout });
      break;
    case -1:
      figma.notify(special, { timeout });
      break;
    case 0:
      figma.notify(empty, { timeout });
      break;
    case 1:
      figma.notify(single, { timeout });
      break;
    default:
      figma.notify(multiple, { timeout });
  }

  figma.closePlugin();
};

interface notificationOptions {
  layerIndex?: number;
  layersLength?: number;
  stylerIndex?: number;
  stylersLength?: number;
  notificationTimeout?: number;
}

export const showNotificationAtArrayEnd = (type, notificationOptions: notificationOptions = {}) => {
  const {
    layerIndex = 0,
    layersLength = 1,
    stylerIndex = 0,
    stylersLength = 1,
    notificationTimeout = defaultSettings.notificationTimeout,
  } = notificationOptions;

  if (layerIndex === layersLength - 1 && stylerIndex === stylersLength - 1) {
    showNofication(counter[type], messages(counter)[type], notificationTimeout);
  }
};
