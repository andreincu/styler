export const CMD = figma.command;

export const counter = {
  applied: 0,
  created: 0,
  detached: 0,
  extracted: 0,
  generated: 0,
  ignored: 0,
  renamed: 0,
  removed: 0,
  updated: 0,
};

export const messages = (counterParam = counter) => {
  return {
    applied: {
      empty: `🤔 No local style found to apply. Maybe? Renam...`,
      single: `✌️ Applied only ${counterParam.applied} style. He he...`,
      multiple: `✌️ Applied ${counterParam.applied} styles. He he...`,
    },
    detached: {
      empty: `🤔 No style was applied on any of the selected layers. Idk...`,
      single: `💔 Detached only ${counterParam.detached} style. Layers will miss you...`,
      multiple: `💔 Detached ${counterParam.detached} styles. Layers will miss you...`,
    },
    extracted: {
      empty: `😵 No local style found to extract. Ouch...`,
      single: `😺 Created only ${counterParam.extracted} layer. Uhuu...`,
      multiple: `😺 Created ${counterParam.extracted} layers. Uhuu...`,
    },
    generated: {
      empty: `😭 We do not support empty or mixed properties. Oh, Noo...`,
      multiple: `
      🔨 Created: ${counterParam.created} -
      ✨ Updated: ${counterParam.updated} -
      🌈 Renamed: ${counterParam.renamed} -
      😶 No changes: ${counterParam.ignored}
    `,
    },
    removed: {
      empty: `🤔 No local style was applied on any of the selected layers. Yep, it's not weird...`,
      single: `🔥 Removed only ${counterParam.removed} style. Rrr...`,
      multiple: `🔥 Removed ${counterParam.removed} styles. Rrr...`,
    },
    layers: {
      empty: '🥰 You must select at least 1 layer. Yea...',
    },
  };
};

export const showNofication = (
  counter: {},
  messages: { empty?: string; multiple?: string; single?: string },
  notificationTimeout: number,
) => {
  const { empty = '', multiple = '', single = multiple } = messages;

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

export const showNotificationAtArrayEnd = (actionType, notificationTimeout, options: any = {}) => {
  const { layerIndex = 0, layersLength = 1, stylerIndex = 0, stylersLength = 1 } = options;
  if (layerIndex === layersLength - 1 && stylerIndex === stylersLength - 1) {
    showNofication(counter[actionType], messages()[actionType], notificationTimeout);
  }
};
/* 
--- COLORS
 */
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };
