import { Config } from './config';
import { defaultSettings } from './default-settings.js';
import { CMD, colors, counter, allMessages } from './globals';
import { cleanSelection, createFrameLayer, createTextLayer, ungroupToCanvas } from './layers';
import { chunk, figmaNotifyAndClose, groupBy, uniq } from './utils';

export const getMessage = (counter, messages: any = {}, options = defaultSettings) => {
  const { notificationTimeout } = options;
  const { empty = '', multiple = '', single = multiple } = messages;

  if (counter === 0) {
    figmaNotifyAndClose(empty, notificationTimeout);
  } else if (counter === 1) {
    figmaNotifyAndClose(single, notificationTimeout);
  } else {
    figmaNotifyAndClose(multiple, notificationTimeout);
  }
};

export const showNofication = () => {
  const messages = allMessages(counter).stylers;

  if (CMD === 'extract-all-styles') {
    getMessage(counter.extracted, messages.extracted);
  } else if (CMD === 'generate-all-styles') {
    getMessage(counter.generated, messages.generated);
  } else if (CMD === 'apply-all-styles') {
    getMessage(counter.applied, messages.applied);
  } else if (CMD === 'detach-all-styles') {
    getMessage(counter.detached, messages.detached);
  } else if (CMD.includes('remove')) {
    getMessage(counter.removed, messages.removed);
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
    figmaNotifyAndClose(allMessages().layers.empty, notificationTimeout);
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
  const styles = getAllLocalStyles();

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
            color: colors.black,
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

export const getAllLocalStyles = (): BaseStyle[] => {
  return [
    ...figma.getLocalTextStyles(),
    ...figma.getLocalGridStyles(),
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
  ];
};

export const updateStyleNames = (currentConfig: Config, newConfig: Config) => {
  const { allStylers } = currentConfig;
  const styles = getAllLocalStyles();

  styles.map((style) => {
    if (!styles) {
      return;
    }

    allStylers.map((styler) => {
      if (style.type !== styler.styleType) {
        return;
      }

      const { name, prefix: oldPrefix, suffix: oldSuffix, layerPropType } = styler;
      const newPrefix = newConfig[name]?.prefix;
      const newSuffix = newConfig[name]?.suffix;

      let styleType = 'FILL';
      if (
        (oldPrefix !== '' || oldSuffix !== '') &&
        style.name.indexOf(oldPrefix) === 0 &&
        style.name.lastIndexOf(oldSuffix) !== -1
      ) {
        styleType = layerPropType;
      }

      // Sorry, future me, for styler, but I was tired :(
      if (style.type === 'PAINT') {
        if (styleType === layerPropType && newPrefix !== oldPrefix) {
          style.name = style.name.replace(oldPrefix, newPrefix);
        }
        if (styleType === layerPropType && newSuffix !== oldSuffix) {
          const pos = style.name.lastIndexOf(oldSuffix);
          style.name = style.name.slice(0, pos) + newSuffix;
        }
      } else {
        if (newPrefix !== oldPrefix) {
          style.name = style.name.replace(oldPrefix, newPrefix);
        }
        if (newSuffix !== oldSuffix) {
          const pos = style.name.lastIndexOf(oldSuffix);
          style.name = style.name.slice(0, pos) + newSuffix;
        }
      }
    });
  });
};
