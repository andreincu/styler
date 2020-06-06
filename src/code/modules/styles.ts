import { black, CMD, counter } from './globals';
import { cleanSelection, createFrameLayer, createTextLayer, ungroupToCanvas } from './layers';
import { chunk, figmaNotifyAndClose, groupBy, uniq } from './utils';
import { defaultSettings } from './default-settings.js';

export const showMessage = (counter, messages: any = {}, options = defaultSettings) => {
  const { notificationTimeout } = options;
  const { empty = '', single = '', multiple = '' } = messages;

  if (counter === 0) {
    figmaNotifyAndClose(empty, notificationTimeout);
  } else if (counter === 1) {
    figmaNotifyAndClose(single, notificationTimeout);
  } else {
    figmaNotifyAndClose(multiple, notificationTimeout);
  }
};

export const showNofication = () => {
  const generateMessage = `
    🔨 Created: ${counter.created} -
    ✨ Updated: ${counter.updated} -
    🌈 Renamed: ${counter.renamed} -
    😶 No changes: ${counter.ignored}
  `;

  const messages = {
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
      single: generateMessage,
      multiple: generateMessage,
    },
    removed: {
      empty: `🤔 No local style was applied on any of the selected layers. Yep, it's not weird...`,
      single: `🔥 Removed only ${counter.removed} style. Rrr...`,
      multiple: `🔥 Removed ${counter.removed} styles. Rrr...`,
    },
  };

  if (CMD === 'extract-all-styles') {
    showMessage(counter.extracted, messages.extracted);
  } else if (CMD === 'generate-all-styles') {
    showMessage(counter.generated, messages.generated);
  } else if (CMD === 'apply-all-styles') {
    showMessage(counter.applied, messages.applied);
  } else if (CMD === 'detach-all-styles') {
    showMessage(counter.detached, messages.detached);
  } else if (CMD.includes('remove')) {
    showMessage(counter.removed, messages.removed);
  }
};

export const getUniqueStylesName = (styles, options = defaultSettings) => {
  const { allStylers } = options;
  const names = styles.map((style) => style.name);
  const affixes = allStylers
    .map((styler) => [styler.prefix, styler.suffix])
    .flat()
    .filter(Boolean)
    .join('|');

  const regexAffixes = new RegExp('\\b(?:' + affixes + ')\\b', 'g');
  const namesWithoutAffixes = names.map((style) => style.replace(regexAffixes, ''));

  return uniq(namesWithoutAffixes) as string[];
};

export const getStyleguides = (styles, options = defaultSettings) => {
  const { texter } = options;
  const uniqueStylesNames = getUniqueStylesName(styles);

  return uniqueStylesNames.map((name) => {
    const nameMatch = texter.getStyleByName(name);
    const type = !nameMatch ? 'FRAME' : 'TEXT';

    return {
      name,
      type,
    };
  });
};

export const changeAllStyles = async (options = defaultSettings) => {
  const { notificationTimeout, allStylers, stylersWithoutTexter } = options;
  const selection = cleanSelection();

  if (selection.length === 0) {
    figmaNotifyAndClose(`🥰 You must select at least 1 layer. Yea...`, notificationTimeout);
    return;
  }

  await Promise.all(
    selection.map(async (layer) => {
      let stylers = allStylers;
      const oldLayerName = layer.name;

      if (layer.type === 'TEXT') {
        await figma.loadFontAsync(layer.fontName as FontName);

        if (layer.name[0] !== '+') {
          stylers = stylersWithoutTexter;
        }
      }

      if (layer.name[0] === '+') {
        layer.name = layer.name.slice(1);
      }

      stylers.map((styler) => {
        const idMatch = styler.getStyleById(layer);
        const nameMatch =
          oldLayerName[0] === '+'
            ? styler.getStyleByName(layer.name, { exactMatch: false })
            : styler.getStyleByName(layer.name);

        if (CMD === 'generate-all-styles') {
          styler.generateStyle(layer, { nameMatch, idMatch });
        } else if (CMD === 'apply-all-styles') {
          styler.applyStyle(layer, nameMatch, { oldName: oldLayerName });
        } else if (CMD === 'detach-all-styles') {
          styler.detachStyle(layer);
        } else if (CMD.includes('remove')) {
          styler.removeStyle(idMatch);
        }
      });

      layer.name = oldLayerName;
    }),
  );

  showNofication();
};

export const extractAllStyles = async (options = defaultSettings) => {
  const { framesPerRow } = options;
  const styles = [
    ...figma.getLocalTextStyles(),
    ...figma.getLocalGridStyles(),
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
  ];

  const selection = [];
  const styleguides = getStyleguides(styles);

  if (styleguides.length > 0) {
    const styleguidesByType = groupBy(styleguides, 'type');

    const mainContainer = createFrameLayer({
      layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
    });

    if (styleguidesByType.TEXT) {
      const textsContainer = createFrameLayer({
        layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
        parent: mainContainer,
      });

      await Promise.all(
        styleguidesByType.TEXT.map(async (styleguide) => {
          const newLayer = await createTextLayer({
            characters: styleguide.name,
            color: black,
            parent: textsContainer,
          });

          selection.push(newLayer);
          counter.extracted++;
        }),
      );
    }

    if (styleguidesByType.FRAME) {
      const visualsContainer = createFrameLayer({
        layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
        parent: mainContainer,
      });

      chunk(styleguidesByType.FRAME, framesPerRow).map((styleguides) => {
        const chunkContainer = createFrameLayer({
          layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
          parent: visualsContainer,
        });

        styleguides.map((styleguide) => {
          const newLayer = createFrameLayer({ name: styleguide.name, size: 80, parent: chunkContainer });

          selection.push(newLayer);
          counter.extracted++;
        });
      });
    }
  }
  ungroupToCanvas(selection);

  showNofication();
};

export const checkStyleType = (style, options = defaultSettings) => {
  const { filler, strokeer } = options;
  let type = 'FILL';
  [filler, strokeer].map((styler) => {
    if (
      (styler.prefix !== '' || styler.suffix !== '') &&
      style.name.indexOf(styler.prefix) === 0 &&
      style.name.lastIndexOf(styler.suffix) !== -1
    ) {
      type = styler.layerPropType;
    }
  });
  return type;
};
