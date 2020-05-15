import { addAffixTo, ucFirst, isArrayEmpty, figmaNotifyAndClose, uniq } from './utils/common';
import { editObjectColor, setAutoFlow } from './utils/layers';

const toStyleId = (prop) => (prop === undefined ? undefined : addAffixTo(prop.toLocaleLowerCase(), '', 'StyleId'));
const TIMEOUT = 8000;

export class Styler {
  styleType: string;
  styleProperties: string[];
  layerProperties: string[];
  layerPropertyType: string;
  layerStyleId: string;
  prefix: string;
  suffix: string;
  createStyleCommand: string;

  constructor(options: {
    styleType: string;
    styleProperties: string[];
    layerProperties?: string[];
    layerPropertyType?: string;
    prefix?: string;
    suffix?: string;
  }) {
    this.styleType = (options.styleType || '').toLocaleUpperCase();
    this.styleProperties = options.styleProperties || options.layerProperties;
    this.layerProperties = options.layerProperties || options.styleProperties;
    this.layerPropertyType = (options.layerPropertyType || options.styleType).toLocaleUpperCase();
    this.layerStyleId = toStyleId(this.layerPropertyType);
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';
  }

  applyStyle = (layer, style) => (layer[this.layerStyleId] = style.id);

  createStyle = async (layer) => {
    if (layer.type === 'TEXT') await figma.loadFontAsync(layer.fontName);

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

  removeStyleNameAffix = (name): string => name.replace(this.suffix, '').replace(this.prefix, '');

  updateStyle = async (layer, style) => {
    if (layer.type === 'TEXT') await figma.loadFontAsync(layer.fontName);

    this.detachStyle(layer);
    this.layerProperties.map((prop, index) => (style[this.styleProperties[index]] = layer[prop]));
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

    cleanedStylers.map((styler) => {
      // we don't care about empty properties
      if (styler.isPropEmpty(layer) || styler.isPropMixed(layer)) {
        return;
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
    const nameMatch = styler.getStyleByName(name);

    if (isArrayEmpty(nameMatch)) return;

    collectedStyles.push(nameMatch);
  });

  return collectedStyles;
};

export const getStylesheets = (styles, stylers) => {
  const uniqueStylesNames = getAllUniqueStylesName(styles, stylers, true);

  return uniqueStylesNames.map((name) => {
    const collectedStyles = getAllStylesByName(name, stylers);
    const type = collectedStyles.some((style) => style.type === 'TEXT') ? 'TEXT' : 'FRAME';

    return {
      name,
      type,
      styles: collectedStyles,
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

  if (isArrayEmpty(styles)) {
    figmaNotifyAndClose(`😵 There is no style in this file. Ouch...`, TIMEOUT);
    return;
  }

  const stylesheets = getStylesheets(styles, stylers);

  const stylesheetsContainer = figma.createFrame();
  setAutoFlow(stylesheetsContainer, { direction: 'HORIZONTAL', gutter: 32 });
  stylesheetsContainer.x = 0;
  stylesheetsContainer.y = 0;

  const textsContainer = figma.createFrame();
  setAutoFlow(textsContainer, { direction: 'VERTICAL', gutter: 32 });
  stylesheetsContainer.appendChild(textsContainer);

  const visualsContainer = figma.createFrame();
  setAutoFlow(visualsContainer, { direction: 'HORIZONTAL', gutter: 48 });
  stylesheetsContainer.appendChild(visualsContainer);

  const createdLayers = [];

  stylesheets.map((stylesheet) => {
    if (stylesheet.type === 'TEXT') {
      const newLayer = figma.createText();

      stylesheet.styles.map(async (style) => {
        stylers.map((styler) => styler.applyStyle(newLayer, style));
        await figma.loadFontAsync(style.fontName);
        newLayer.characters = stylesheet.name;
      });

      editObjectColor(newLayer, 'fills', '#ffffff');
      textsContainer.appendChild(newLayer);
      createdLayers.push(newLayer);
    }
    // visual container
    else {
      const newLayer = figma.createFrame();

      stylesheet.styles.map((style) => stylers.map((styler) => styler.applyStyle(newLayer, style)));

      newLayer.name = stylesheet.name;
      newLayer.resize(80, 80);

      visualsContainer.appendChild(newLayer);
      createdLayers.push(newLayer);
    }
  });

  figma.closePlugin();
};
