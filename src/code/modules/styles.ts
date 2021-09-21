import { Config } from './config';
import { CMD, colors, counter, messages, showNofication, showNotificationAtArrayEnd } from './globals';
import { cleanSelection, createFrameLayer, createTextLayer, ungroup, createLayer } from './layers';
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

    if (isArrayEmpty(styles)) {
      return;
    }

    styles.map((style) => {
      if (style.type !== styler.styleType || checkStyleType(style, currentConfig) !== styler.layerPropType) {
        return;
      }

      const { name } = styler;
      const newPrefix = newConfig[name].prefix;
      const newSuffix = newConfig[name].suffix;

      if (newPrefix === styler.prefix && newSuffix === styler.suffix) {
        return;
      }

      style.name = styler.replaceAffix(style.name, newPrefix, newSuffix);
      counter.customize++;
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
    reverseLayers,
  } = config;
  const layers = cleanSelection({ reverseLayers });

  if (isArrayEmpty(layers)) {
    showNofication(0, messages(counter).layers, notificationTimeout);
    return;
  }

  const layersLength = layers.length;
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
        styler.applyStyle(layer, styleNameMatch);
        showNotificationAtArrayEnd('applied', notificationOptions);
      }

      // detach
      else if (CMD === 'detach-all-styles') {
        styler.detachStyle(layer);
        showNotificationAtArrayEnd('detached', notificationOptions);
      }

      // remove
      else if (CMD.includes('remove')) {
        styler.removeStyle(layer, styleIdMatch);
        showNotificationAtArrayEnd('removed', notificationOptions);
      } else {
        figma.closePlugin('🤷‍♂️ This should not happen. Nothing was changed...');
      }
    });

    layer.name = oldLayerName;
  });
};

export const extractAllStyles = async (config) => {
  const { allStylers, framesPerSection, textsPerSection } = config;

  if (isArrayEmpty(getAllLocalStyles())) {
    return;
  }

  // preparing the template
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
  let newSection: FrameNode;

  for (const styler of allStylers) {
    const styles = styler.getLocalStyles();

    if (isArrayEmpty(styles)) {
      continue;
    }

    const parentByType = styler.styleType === 'TEXT' ? textContainer : miscContainer;
    const flowByType = styler.styleType === 'TEXT' ? vertFlow : horizFlow;
    const itemsPerSection = styler.styleType === 'TEXT' ? textsPerSection : framesPerSection;
    const optionByType = styler.styleType === 'TEXT' ? { color: colors.black } : { size: 80, color: colors.white };

    await Promise.all(
      styles.map(async (style, styleIndex) => {
        if (style.type !== styler.styleType || checkStyleType(style, config) !== styler.layerPropType) {
          return;
        }

        const curatedStyleName = styler.replaceAffix(style.name, '');

        let layerMatch = createdLayers.find((layer) => layer.name === curatedStyleName);

        if (!layerMatch) {
          if (styleIndex % itemsPerSection === 0) {
            newSection = createFrameLayer('section', parentByType, flowByType);
          }

          layerMatch = await createLayer(curatedStyleName, newSection, style.type, optionByType);
          createdLayers.push(layerMatch);
          counter.extracted++;
        }

        styler.applyStyle(layerMatch, style);
      }),
    );
  }

  await new Promise((res) => setTimeout(res, 100));

  figma.group(createdLayers, figma.currentPage);
  createdLayers.map((layer) => ungroup(layer));
  figma.viewport.scrollAndZoomIntoView(createdLayers);
  mainContainer.remove();
};
