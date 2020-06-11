import { Config } from './config';
import { CMD, colors, counter, messages, showNofication, showNotificationAtArrayEnd } from './globals';
import { cleanSelection, createFrameLayer, createTextLayer, ungroup } from './layers';
import { checkStyleType, isArrayEmpty } from './utils';
import { resolve } from 'dns';

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
  } = config;
  const layers = cleanSelection();

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

  let createdLayers = [];
  let newSection: FrameNode;
  let textContainer;
  let miscContainer;

  let count = 0;

  for (let styler of allStylers) {
    const styles = styler.getLocalStyles();

    if (isArrayEmpty(styles)) {
      continue;
    }

    await Promise.all(
      styles.map(async (style) => {
        if (style.type !== styler.styleType || checkStyleType(style, config) !== styler.layerPropType) {
          return;
        }

        const styleName = styler.replaceAffix(style.name, '');
        let layerMatch = createdLayers.find((layer) => layer.name === styleName);

        if (!layerMatch && style.type === 'TEXT') {
          if (counter.textContainer % textsPerSection === 0) {
            if (counter.textContainer === 0) {
              textContainer = createFrameLayer('text', mainContainer, horizFlow);
            }

            newSection = createFrameLayer('section', textContainer, vertFlow);
          }

          counter.textContainer++;
          layerMatch = await createTextLayer(styleName, newSection, { color: colors.black });
          createdLayers.push(layerMatch);
        }
        //
        else if (!layerMatch) {
          if (counter.miscContainer % framesPerSection === 0) {
            if (counter.miscContainer === 0) {
              miscContainer = createFrameLayer('misc', mainContainer, vertFlow);
            }

            newSection = createFrameLayer('section', miscContainer, horizFlow);
          }

          counter.miscContainer++;
          layerMatch = createFrameLayer(styleName, newSection, { size: 80, color: colors.white });
          createdLayers.push(layerMatch);
        }

        styler.applyStyle(layerMatch, style);
        counter.extracted++;
        console.log(count);
      }),
    );
  }

  figma.group(createdLayers, figma.currentPage);
  createdLayers.map((layer) => ungroup(layer));
  mainContainer.remove();

  figma.viewport.scrollAndZoomIntoView(createdLayers);
};
