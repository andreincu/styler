import { TIMEOUT, colors } from './globals';
import { addAffixTo, ucFirst, isArrayEmpty, figmaNotifyAndClose, uniq, groupBy, chunk } from './utils';
import { editObjectColor, createFrameLayer, ungroupEachToCanvas } from './layers';

interface StylerOptions {
  styleType?: string;
  styleProperties?: string[];
  layerProperties?: string[];
  layerPropertyType?: string;
  prefix?: string;
  suffix?: string;
}

export class Styler {
  styleType: string;
  styleProperties: string[];
  layerProperties: string[];
  layerPropertyType: string;
  layerStyleId: string;
  prefix: string;
  suffix: string;

  constructor(options: StylerOptions = {}) {
    const {
      styleType = '',
      styleProperties,
      layerProperties,
      layerPropertyType = styleType,
      prefix = '',
      suffix = '',
    } = options;

    this.styleType = styleType.toLocaleUpperCase();
    this.styleProperties = styleProperties || layerProperties;
    this.layerProperties = layerProperties || styleProperties;
    this.layerPropertyType = layerPropertyType.toLocaleUpperCase();
    this.layerStyleId = addAffixTo(layerPropertyType.toLocaleLowerCase(), '', 'StyleId');
    this.prefix = prefix;
    this.suffix = suffix;
  }

  applyStyle = (layer, style) => {
    if (!style) return;

    return (layer[this.layerStyleId] = style.id);
  };

  createStyle = (layer) => {
    const createCommand = addAffixTo(ucFirst(this.styleType), 'create', 'Style');
    const newStyle = figma[createCommand]();

    this.renameStyle(layer, newStyle);
    this.updateStyle(layer, newStyle);

    return newStyle;
  };

  detachStyle = (layer) => (layer[this.layerStyleId] = '');

  getLocalStyles = () => {
    const getCommand = addAffixTo(ucFirst(this.styleType), 'getLocal', 'Styles');
    return figma[getCommand]();
  };

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleId]);

  getStyleByName = (name) => {
    const stylesByType = this.getLocalStyles();
    return stylesByType.find((style) => style.name === addAffixTo(name, this.prefix, this.suffix));
  };

  renameStyle = (layer, style) => (style.name = addAffixTo(layer.name, this.prefix, this.suffix));

  updateStyle = (layer, style) => {
    this.detachStyle(layer);
    this.styleProperties.map((prop, index) => (style[prop] = layer[this.layerProperties[index]]));
    this.applyStyle(layer, style);

    return style;
  };

  isPropMixed = (layer) => this.layerProperties.some((prop) => layer[prop] === figma.mixed);

  // I could actually check the entire array, but I don't think is necessary
  isPropEmpty = (layer) => isArrayEmpty(layer[this.layerProperties[0]]);
}

function cleanStylers(layer, stylers) {
  if (layer.type === 'TEXT') {
    return stylers.filter((styler) => styler.layerPropertyType === 'TEXT');
  }

  return stylers.filter((styler) => styler.layerPropertyType !== 'TEXT');
}

export const applyAllLayerStyles = (layers, stylers) => {
  let counter = 0;

  layers.map((layer) => {
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map((styler) => {
      const nameMatch = styler.getStyleByName(layer.name);

      if (!nameMatch) return;

      styler.applyStyle(layer, nameMatch);
      counter++;
    });
  });

  if (counter === 0) {
    figmaNotifyAndClose(`🤔 There is no style that has this layer name. Maybe? Renam...`, TIMEOUT);
    return;
  }
  figmaNotifyAndClose(`✌️ Applied ${counter} styles. He he...`, TIMEOUT);
};

export const detachAllLayerStyles = (layers, stylers) => {
  let counter = 0;

  layers.map((layer) => {
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map((styler) => {
      if (layer[styler.layerStyleId] === '') return;

      styler.detachStyle(layer);
      counter++;
    });
  });

  if (counter === 0) {
    figmaNotifyAndClose(`🤔 No style was applied on any of the selected layers. Idk...`, TIMEOUT);
    return;
  }
  figmaNotifyAndClose(`💔 Detached ${counter} styles. Layers will miss you...`, TIMEOUT);
};

export const generateAllLayerStyles = (layers, stylers) => {
  const counter = {
    created: 0,
    ignored: 0,
    renamed: 0,
    updated: 0,
  };

  layers.map((layer) => {
    // stylers are the links between layers and styles that are created by figma code inconsistency or design decision itself (which are not bad and simply exist)
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map(async (styler) => {
      // we don't care about empty properties
      if (styler.isPropEmpty(layer) || styler.isPropMixed(layer)) {
        return;
      }

      if (layer.type === 'TEXT') {
        await figma.loadFontAsync(layer.fontName);
      }

      const idMatch = styler.getStyleById(layer);
      const nameMatch = styler.getStyleByName(layer.name);

      // create
      if (!idMatch && !nameMatch) {
        styler.createStyle(layer);
        counter.created++;
      }

      // rename
      else if (idMatch && !nameMatch) {
        styler.renameStyle(layer, idMatch);
        counter.renamed++;
      }

      // update
      else if ((!idMatch && nameMatch) || idMatch !== nameMatch) {
        styler.updateStyle(layer, nameMatch);
        counter.updated++;
      }

      // ignore
      else {
        counter.ignored++;
      }
    });
  });

  if (counter.created === 0 && counter.updated === 0 && counter.renamed === 0 && counter.ignored === 0) {
    figmaNotifyAndClose(`😭 We do not support empty or mixed properties. Oh, Noo...`, TIMEOUT);
    return;
  }
  figmaNotifyAndClose(
    `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      🌈 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
    TIMEOUT,
  );
};

export const removeAllLayerStyles = (layers, stylers) => {
  let counter = 0;

  layers.map((layer) => {
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map((styler) => {
      const idMatch = styler.getStyleById(layer);
      if (!idMatch) return;

      idMatch.remove();
      counter++;
    });
  });

  if (counter === 0) {
    figmaNotifyAndClose(`🤔 No style was applied on any of the selected layers. Yep, it's not weird...`, TIMEOUT);
    return;
  }
  figmaNotifyAndClose(`🔥 Removed ${counter} styles. Rrr...`, TIMEOUT);
};

export const removeLayerStylesByType = (layers, stylers, CMD) => {
  let counter = 0;
  const removeType = CMD.split('-')[1];

  layers.map((layer) => {
    stylers
      .filter((styler) => styler.layerPropertyType === removeType.toLocaleUpperCase())
      .map((styler) => {
        const idMatch = styler.getStyleById(layer);
        if (!idMatch) return;

        idMatch.remove();
        counter++;
      });
  });

  if (counter === 0) {
    figmaNotifyAndClose(`🤔 No ${removeType} style was applied on any of the selected layers. Whaa...`, TIMEOUT);
    return;
  }
  figmaNotifyAndClose(`🔥 Removed ${counter} ${removeType} styles. Ups...`, TIMEOUT);
};

export const getAllUniqueStylesName = (styles, stylers, sort = false): string[] => {
  const allStylesName = styles.map((style) => style.name);
  const affixes = stylers
    .map((styler) => [styler.suffix, styler.prefix])
    .flat()
    .filter(Boolean)
    .join('|');
  const regexAffixes = new RegExp('\\b(?:' + affixes + ')\\b', 'g');

  const namesWithoutAffixes = allStylesName.map((style) => style.replace(regexAffixes, ''));

  return uniq(namesWithoutAffixes, sort) as string[];
};

export const getAllStylesByName = (name, stylers) => {
  const collectedStyles = [];

  stylers.map((styler) => {
    const style = styler.getStyleByName(name);
    const layerPropType = styler.layerPropertyType;

    if (isArrayEmpty(style)) return;

    collectedStyles.push({ layerPropType, style });
  });

  return collectedStyles;
};

export const getStylesheets = (styles, stylers) => {
  const uniqueStylesNames = getAllUniqueStylesName(styles, stylers);

  return uniqueStylesNames.map((name) => {
    const collectedStyles = getAllStylesByName(name, stylers);
    const type = collectedStyles.some(({ style }) => style.type === 'TEXT') ? 'TEXT' : 'FRAME';

    return {
      name,
      type,
      collectedStyles,
    };
  });
};

export const extractAllStyles = async (stylers) => {
  const styles = [
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
    ...figma.getLocalGridStyles(),
    ...figma.getLocalTextStyles(),
  ];
  let counter = 0;

  if (isArrayEmpty(styles)) {
    figmaNotifyAndClose(`😵 There is no style in this file. Ouch...`, TIMEOUT);
    return;
  }

  let selection = [];

  editObjectColor(figma.currentPage, 'backgrounds', colors.black);
  const stylesheetsByType = groupBy(getStylesheets(styles, stylers), 'type');

  const mainContainer = await createFrameLayer({
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
    color: colors.transparent,
  });

  const textsContainer = await createFrameLayer({
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
    color: colors.transparent,
    parent: mainContainer,
  });

  const visualsContainer = await createFrameLayer({
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
    color: colors.transparent,
    parent: mainContainer,
  });

  [...stylesheetsByType.TEXT].map(async (stylesheet) => {
    const newLayer = figma.createText();
    await figma.loadFontAsync(newLayer.fontName as FontName);

    const cleanedStylers = cleanStylers(newLayer, stylers);

    stylesheet.collectedStyles.map(({ layerPropType, style }) =>
      cleanedStylers.map((styler) => {
        if (styler.layerPropertyType !== layerPropType) return;

        styler.applyStyle(newLayer, style);
      }),
    );

    newLayer.characters = stylesheet.name;
    editObjectColor(newLayer, 'fills', colors.white);
    textsContainer.appendChild(newLayer);
    selection.push(newLayer);
    counter++;
  });

  chunk([...stylesheetsByType.FRAME], 3).map(async (stylesheets) => {
    const chunkContainer = await createFrameLayer({
      layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
      color: colors.transparent,
      parent: visualsContainer,
    });

    stylesheets.map((stylesheet) => {
      const newLayer = figma.createFrame();
      const cleanedStylers = cleanStylers(newLayer, stylers);

      stylesheet.collectedStyles.map(({ layerPropType, style }) =>
        cleanedStylers.map((styler) => {
          if (styler.layerPropertyType !== layerPropType) return;

          styler.applyStyle(newLayer, style);
        }),
      );

      newLayer.name = stylesheet.name;
      newLayer.resize(80, 80);

      chunkContainer.appendChild(newLayer);
      selection.push(newLayer);
      counter++;
    });
  });

  setTimeout(() => {
    ungroupEachToCanvas(selection);
    figmaNotifyAndClose(`😺 Created ${counter} layers. Uhuu...`, TIMEOUT);
  }, 200);
};
