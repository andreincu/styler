import { addAffixTo, ucFirst, isArrayEmpty, figmaNotifyAndClose } from './utils/common';

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

  applyStyle = (layer, style) => {
    layer[this.layerStyleId] = style.id;
  };

  createStyle = async (layer) => {
    if (layer.type === 'TEXT') await figma.loadFontAsync(layer.fontName);

    const createCommand = addAffixTo(ucFirst(this.styleType), 'create', 'Style');
    const newStyle = figma[createCommand]();

    this.renameStyle(layer, newStyle);
    this.updateStyle(layer, newStyle);

    return newStyle;
  };

  detachStyle = (layer) => {
    if (layer[this.layerStyleId] === '') return;

    layer[this.layerStyleId] = '';
  };

  getLocalStyles = () => {
    const getCommand = addAffixTo(ucFirst(this.styleType), 'getLocal', 'Styles');
    return figma[getCommand]();
  };

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleId]);

  getStyleByName = (layer) => {
    const stylesByType = this.getLocalStyles();
    return stylesByType.find((style) => style.name === addAffixTo(layer.name, this.prefix, this.suffix));
  };

  renameStyle = (layer, style) => (style.name = addAffixTo(layer.name, this.prefix, this.suffix));

  updateStyle = (layer, style) => {
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

// this is something that combine multiple existing actions (create, update, rename)
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
      if (styler.isPropEmpty(layer)) {
        return;
      }

      // we also don't care about mixed properties
      if (styler.isPropMixed(layer)) {
        counter.ignored++;
        return;
      }

      const idMatch = styler.getStyleById(layer);
      const nameMatch = styler.getStyleByName(layer);

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

// applying all layer's styles
export const applyAllLayerStyles = (layers, stylers) => {
  let counter = 0;

  layers.map((layer) => {
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map((styler) => {
      const nameMatch = styler.getStyleByName(layer);

      if (!nameMatch) return;

      styler.applyStyle(layer, nameMatch);
      counter++;
    });
  });

  figmaNotifyAndClose(`✌️ Applied ${counter} styles.`, TIMEOUT);
};

// detaching all layer's styles
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

  figmaNotifyAndClose(`💔 Detached ${counter} styles.`, TIMEOUT);
};

// removing all layers's styles
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

  figmaNotifyAndClose(`🔥 Removed ${counter} styles.`, TIMEOUT);
};

// removing styles
export const removeLayerStylesByType = (layers, stylers, removeType) => {
  let counter = 0;

  layers.map((layer) => {
    const cleanedStylers = cleanStylers(layer, stylers);

    cleanedStylers.map((styler) => {
      const idMatch = styler.getStyleById(layer);
      const stylerType = addAffixTo(styler.layerPropertyType, 'remove', 'styles');
      if (!idMatch || removeType !== stylerType) return;

      idMatch.remove();
      counter++;
    });
  });

  figmaNotifyAndClose(`🔥 Removed ${counter} styles.`, TIMEOUT);
};
