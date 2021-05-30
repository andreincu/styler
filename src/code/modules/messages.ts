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
      single: `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      👻 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
      multiple: `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      👻 Renamed: ${counter.renamed} -
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
      empty: '😎 You must select at least 1 layer. Yea...',
    },
    cancelSettings: {
      empty: '🥺 Nothing was changed, everything is as before.',
    },
    clearCache: {
      empty: '🧹 Cleaned saved settings from cache.',
    },
  };
};
