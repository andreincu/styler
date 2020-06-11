import { defaultSettings } from './default-settings.js';

export const CMD = figma.command;

export const counter = {
  applied: 0,
  created: 0,
  customize: 0,
  detached: 0,
  extracted: 0,
  generated: 0,
  textContainer: 0,
  miscContainer: 0,
  ignored: 0,
  renamed: 0,
  removed: 0,
  updated: 0,
};

export const messages = (counter) => {
  return {
    applied: {
      empty: `🤔 No local style found to apply. Maybe? Renam...`,
      single: `✌️ Applied only ${counter.applied} style. He he...`,
      multiple: `✌️ Applied ${counter.applied} styles. He he...`,
    },
    detached: {
      empty: `🤔 No style was applied on any of the selected layers. Idk...`,
      single: `💔 Detached only ${counter.detached} style. Layers will miss you...`,
      multiple: `💔 Detached ${counter.detached} styles. Layers will miss you...`,
    },
    extracted: {
      empty: `😵 No local style found to extract. Ouch...`,
      single: `😺 Created only ${counter.extracted} layer. Uhuu...`,
      multiple: `😺 Created ${counter.extracted} layers. Uhuu...`,
    },
    generated: {
      empty: `😭 We do not support empty or mixed properties. Oh, Noo...`,
      multiple: `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      🌈 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
    },
    removed: {
      empty: `🤔 No local style was applied on any of the selected layers. Yep, it's not weird...`,
      single: `🔥 Removed only ${counter.removed} style. Rrr...`,
      multiple: `🔥 Removed ${counter.removed} styles. Rrr...`,
    },
    customize: {
      empty: '🌟 Settings were saved, but there was nothing to update.',
      single: '✅ Settings were saved and only 1 style was updated.',
      multiple: `✅ Settings were saved and ${counter.customize} style was updated.`,
    },
    layers: {
      empty: '🥰 You must select at least 1 layer. Yea...',
    },
    cancelSettings: {
      empty: '🥺 Nothing was changed, everything is as before.',
    },
    clearCache: {
      empty: '🧹 Cleaned saved settings from cache.',
    },
  };
};

export const showNofication = (
  counter = 0,
  messages: any = { empty: '', single: undefined, multiple: '' },
  notificationTimeout: number,
) => {
  const { empty, multiple, single = multiple } = messages;

  if (counter === 0) {
    figma.notify(empty, { timeout: notificationTimeout });
    figma.closePlugin();
  } else if (counter === 1) {
    figma.notify(single, { timeout: notificationTimeout });
    figma.closePlugin();
  } else {
    figma.notify(multiple, { timeout: notificationTimeout });
    figma.closePlugin();
  }
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
/* 
--- COLORS
 */
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };
