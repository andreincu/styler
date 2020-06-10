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
  const { notificationTimeout } = newConfig;

  allStylers.map((styler) => {
    const styles = styler.getLocalStyles();
    if (isArrayEmpty(styles)) {
      showNofication(0, messages(counter).customize, notificationTimeout);
      return;
    }

    styles.map((style) => {
      if (style.type !== styler.styleType || checkStyleType(style, currentConfig) !== styler.layerPropType) {
        return;
      }

      const { name } = styler;
      const newPrefix = newConfig[name].prefix;
      const newSuffix = newConfig[name].suffix;

      style.name = styler.replaceAffix(style.name, newPrefix, newSuffix);
      counter.customize++;
    });
  });

  showNofication(counter.customize, messages(counter).customize, notificationTimeout);
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

      if (layer.name[0] === '-') {
        stylers = texterOnly;
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
  const { allStylers, framesPerSection, textsPerSection, notificationTimeout } = config;

  if (isArrayEmpty(getAllLocalStyles())) {
    showNofication(0, messages(counter).extracted, notificationTimeout);
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
  let textCount = 0;
  let miscCount = 0;

  for (let styler of allStylers) {
    const styles = styler.getLocalStyles();

    if (isArrayEmpty(styles)) {
      return;
    }

    const promise = styles.map(async (style) => {
      if (style.type !== styler.styleType || checkStyleType(style, config) !== styler.layerPropType) {
        return;
      }

      const styleWithoutAffix = styler.replaceAffix(style.name, '');
      let layerMatch = createdLayers.find((layer) => layer.name === styleWithoutAffix);

      if (!layerMatch && style.type === 'TEXT') {
        if (textCount % textsPerSection === 0) {
          newSection = createFrameLayer('section', textContainer, vertFlow);
        }

        textCount++;
        layerMatch = await createTextLayer(styleWithoutAffix, newSection, { color: colors.black });
        createdLayers.push(layerMatch);
      }
      //
      else if (!layerMatch) {
        if (miscCount % framesPerSection === 0) {
          newSection = createFrameLayer('section', miscContainer, horizFlow);
        }

        miscCount++;
        layerMatch = createFrameLayer(styleWithoutAffix, newSection, { size: 80, color: colors.white });
        createdLayers.push(layerMatch);
      }

      styler.applyStyle(layerMatch, style);
      counter.extracted++;
    });

    await Promise.all(promise);
  }

  ungroupToCanvas(createdLayers);

  figma.viewport.scrollAndZoomIntoView(createdLayers);
  showNofication(counter.extracted, messages(counter).extracted, notificationTimeout);
};
