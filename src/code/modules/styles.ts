import { Config } from './config';
import { defaultSettings } from './default-settings.js';
import { CMD, counter, messages, showNofication, showNotificationAtArrayEnd, colors } from './globals';
import { cleanSelection, createFrameLayer, createLayer } from './layers';
import { addAffixTo, isArrayEmpty, replacePrefix, replaceSuffix, uniq } from './utils';

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
    const styleNameMatch = texter.getStyleByName(name);
    const type = !styleNameMatch ? 'FRAME' : 'TEXT';

    return {
      name,
      type,
    };
  });
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

      const { name, prefix: currentPrefix, suffix: currentSuffix, layerPropType } = styler;
      const newPrefix = newConfig[name].prefix;
      const newSuffix = newConfig[name].suffix;
      const styleType = styler.checkStyleType(style);

      // Sorry, future me, for styler, but I was tired :(
      if (style.type === 'PAINT') {
        if (styleType === layerPropType && newPrefix !== currentPrefix) {
          style.name = replacePrefix(style.name, currentPrefix, newPrefix);
        }
        if (styleType === layerPropType && newSuffix !== currentSuffix) {
          style.name = replaceSuffix(style.name, currentSuffix, newSuffix);
        }
      } else {
        if (newPrefix !== currentPrefix) {
          style.name = replacePrefix(style.name, currentPrefix, newPrefix);
        }
        if (newSuffix !== currentSuffix) {
          style.name = replaceSuffix(style.name, currentSuffix, newSuffix);
        }
      }
    });
  });
};

export const changeAllStyles = (config) => {
  const {
    addPrevToDescription,
    allStylers,
    notificationTimeout,
    texterOnly,
    partialMatch,
    updateUsingLocalStyles,
  } = config;
  const layers = cleanSelection();
  const layersLength = layers.length;

  if (layersLength === 0) {
    showNofication(layersLength, messages(counter).layers, notificationTimeout);
    return;
  }

  layers.map(async (layer, layerIndex) => {
    let stylers = allStylers;
    const oldLayerName = layer.name;

    if (layer.type === 'TEXT') {
      await figma.loadFontAsync(layer.fontName as FontName);

      if (layer.name[0] !== '+') {
        stylers = texterOnly;
      } else {
        layer.name = layer.name.slice(1);
      }
    }

    const stylersLength = stylers.length;

    stylers.map((styler, stylerIndex) => {
      const notificationOptions = { layerIndex, layersLength, stylerIndex, stylersLength, notificationTimeout };

      const styleIdMatch = styler.getStyleById(layer);
      const styleNameMatch = styler.getStyleByName(layer.name, partialMatch);

      if (CMD === 'generate-all-styles') {
        styler.generateStyle(layer, { styleNameMatch, styleIdMatch, updateUsingLocalStyles, addPrevToDescription });
        showNotificationAtArrayEnd('generated', notificationOptions);
      }

      // apply
      else if (CMD === 'apply-all-styles') {
        styler.applyStyle(layer, styleNameMatch, oldLayerName);
        showNotificationAtArrayEnd('applied', notificationOptions);
      }

      // detach
      else if (CMD === 'detach-all-styles') {
        styler.detachStyle(layer);
        showNotificationAtArrayEnd('detached', notificationOptions);
      }

      // remove
      else if (CMD.includes('remove')) {
        styler.removeStyle(styleIdMatch);
        showNotificationAtArrayEnd('removed', notificationOptions);
      }
    });

    layer.name = oldLayerName;
  });
};

export const extractAllStyles = async (config) => {
  const { allStylers, framesPerSection, textsPerSection, notificationTimeout } = config;
  const mainContainer = createFrameLayer('main', undefined, {
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
  });

  const textContainer = createFrameLayer('text', mainContainer, {
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
  });

  const miscContainer = createFrameLayer('misc', mainContainer, {
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
  });

  let createdLayers = [];

  for (let styler of allStylers) {
    const styles = styler.getLocalStyles();

    if (isArrayEmpty(styles)) {
      continue;
    }

    for (let style of styles) {
      if (!styler.checkAffix(style)) {
        continue;
      }

      let layerMatch = createdLayers.find(
        (layer) => addAffixTo(layer?.name, styler.prefix, styler.suffix) === style.name,
      );

      if (!layerMatch) {
        const containerType = style.type === 'TEXT' ? textContainer : miscContainer;
        layerMatch = await createLayer(style.name, containerType, styler.styleType, { color: colors.black });

        createdLayers.push(layerMatch);
      }

      console.log(textContainer.children.length);
      console.log(miscContainer.children.length);
      styler.applyStyle(layerMatch, style);
    }
  }

  figma.closePlugin();
  return;
};

// export const extractAllStyles = async (config) => {
//   const { framesPerRow, notificationTimeout } = config;
//   const styles = getAllLocalStyles();

//   const selection = [];
//   const styleguides = getStyleguides(styles);

//   if (styleguides.length > 0) {
//     const styleguidesByType = groupBy(styleguides, 'type');

//     const mainContainer = createFrameLayer({
//       layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
//     });

//     if (styleguidesByType.TEXT) {
//       const textsContainer = createFrameLayer({
//         layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
//         parent: mainContainer,
//       });

//       await Promise.all(
//         styleguidesByType.TEXT.map(async (styleguide) => {
//           const newLayer = await createTextLayer({
//             characters: styleguide.name,
//             color: colors.black,
//             parent: textsContainer,
//           });

//           selection.push(newLayer);
//           counter.extracted++;
//         }),
//       );
//     }

//     if (styleguidesByType.FRAME) {
//       const visualsContainer = createFrameLayer({
//         layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
//         parent: mainContainer,
//       });

//       chunk(styleguidesByType.FRAME, framesPerRow).map((styleguides) => {
//         const chunkContainer = createFrameLayer({
//           layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
//           parent: visualsContainer,
//         });

//         styleguides.map((styleguide) => {
//           const newLayer = createFrameLayer({ name: styleguide.name, size: 80, parent: chunkContainer });

//           selection.push(newLayer);
//           counter.extracted++;
//         });
//       });
//     }
//   }
//   ungroupToCanvas(selection);

//   // showNofication(counter.extracted, messages.extracted, notificationTimeout);
// };
