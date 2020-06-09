import { Config } from './config';
import { CMD, colors, counter, messages, showNofication, showNotificationAtArrayEnd } from './globals';
import { cleanSelection, createFrameLayer, createTextLayer, ungroupToCanvas } from './layers';
import { checkStyleType, isArrayEmpty } from './utils';

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

  allStylers.map((styler) => {
    const styles = styler.getLocalStyles();
    if (!styles) {
      return;
    }

    styles.map((style) => {
      if (style.type !== styler.styleType || checkStyleType(style, currentConfig) !== styler.layerPropType) {
        return;
      }

      const { name, prefix: currentPrefix, suffix: currentSuffix, layerPropType } = styler;
      const newPrefix = newConfig[name].prefix;
      const newSuffix = newConfig[name].suffix;
      const styleType = checkStyleType(style, currentConfig);

      if (newPrefix !== currentPrefix) {
        style.name = styler.replacePrefix(style.name, newPrefix);
      }
      if (newSuffix !== currentSuffix) {
        style.name = styler.replaceSuffix(style.name, newSuffix);
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
  const horizFlow: any = {
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
  };

  const vertFlow: any = {
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
  };
  const mainContainer = createFrameLayer('main', undefined, {
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
  });

  const textContainer = createFrameLayer('text', mainContainer, horizFlow);

  const miscContainer = createFrameLayer('misc', mainContainer, vertFlow);

  let createdLayers = [];

  for (let styler of allStylers) {
    const styles = styler.getLocalStyles();

    if (isArrayEmpty(styles)) {
      return;
    }

    let newSection;
    const promise = styles.map(async (style, index) => {
      if (style.type !== styler.styleType || checkStyleType(style, config) !== styler.layerPropType) {
        return;
      }

      const styleWithoutAffix = styler.replaceAffix(style.name, '');
      let layerMatch = createdLayers.find((layer) => layer.name === styleWithoutAffix);

      if (!layerMatch && style.type === 'TEXT') {
        index % textsPerSection === 0
          ? (newSection = createFrameLayer('section', textContainer, vertFlow))
          : newSection;

        layerMatch = await createTextLayer(styleWithoutAffix, newSection, { color: colors.black });
        createdLayers.push(layerMatch);
      }
      //
      else if (!layerMatch) {
        if (index % framesPerSection === 0) {
          newSection = createFrameLayer('section', miscContainer, horizFlow);
        }

        layerMatch = createFrameLayer(styleWithoutAffix, newSection, { size: 80, color: colors.white });
        createdLayers.push(layerMatch);
      }

      styler.applyStyle(layerMatch, style);
    });

    await Promise.all(promise);
  }

  ungroupToCanvas(createdLayers);

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
