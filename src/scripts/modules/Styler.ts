import { NOTIFICATION_TIMEOUT, colors, texter, stylers, messages, counter, CMD } from './globals';
import { addAffixTo, ucFirst, isArrayEmpty, figmaNotifyAndClose, uniq, groupBy, chunk } from './utils';
import { editObjectColor, createFrameLayer, ungroupEachToCanvas, cleanSelection } from './layers';

interface StylerOptions {
  styleType?: string;
  styleProps?: string[];
  layerProps?: string[];
  layerPropType?: string;
  prefix?: string;
  suffix?: string;
}

export class Styler {
  styleType: string;
  styleProps: string[];
  layerProps: string[];
  layerPropType: string;
  layerStyleID: string;
  prefix: string;
  suffix: string;

  constructor(options: StylerOptions = {}) {
    const { styleType = '', layerPropType = styleType, prefix = '', suffix = '', styleProps, layerProps } = options;

    this.styleType = styleType.toLocaleUpperCase();
    this.styleProps = styleProps || layerProps;
    this.layerProps = layerProps || styleProps;
    this.layerPropType = layerPropType.toLocaleUpperCase();
    this.layerStyleID = addAffixTo(layerPropType.toLocaleLowerCase(), '', 'StyleId');
    this.prefix = prefix;
    this.suffix = suffix;
  }

  applyStyle = (layer: SceneNode, style: BaseStyle) => {
    if (!style || layer[this.layerStyleID] === undefined) {
      console.log(`Apply: ${this.layerStyleID} not found || No style found for ${layer.name}`);
      return;
    }

    layer[this.layerStyleID] = style.id;
    counter.applied++;
  };

  createStyle = (layer: SceneNode) => {
    const newStyle = figma[addAffixTo(ucFirst(this.styleType), 'create', 'Style')]();

    this.renameStyle(layer, newStyle);
    this.updateStyle(layer, newStyle);

    return newStyle;
  };

  detachStyle = (layer) => {
    if (!layer[this.layerStyleID]) {
      console.log(`Detach: ${this.layerPropType} not found.`);
      return;
    }

    layer[this.layerStyleID] = '';
    counter.detached++;
  };

  getLocalStyles = () => {
    const getCommand = addAffixTo(ucFirst(this.styleType), 'getLocal', 'Styles');
    return figma[getCommand]();
  };

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleID]);

  getStyleByName = (name) => {
    const stylesByType = this.getLocalStyles();
    return stylesByType.find((style) => style.name === addAffixTo(name, this.prefix, this.suffix));
  };

  renameStyle = (layer: SceneNode, style: BaseStyle) => {
    if (!style) {
      console.log(`Rename: No style found for ${layer.name}`);
      return;
    }

    style.name = addAffixTo(layer.name, this.prefix, this.suffix);
  };

  updateStyle = (layer: SceneNode, style: BaseStyle) => {
    this.detachStyle(layer);
    this.styleProps.map((prop, index) => {
      if (!style || layer[this.layerProps[index]] === undefined) {
        console.log(`Update: ${this.layerProps[index]} not found || No style found for ${layer.name}`);
        return;
      }

      style[prop] = layer[this.layerProps[index]];
    });
    this.applyStyle(layer, style);
  };

  generateStyle = (layer: SceneNode, { nameMatch, idMatch }: any = {}) => {
    if (this.isPropMixed(layer) || this.isPropEmpty(layer)) {
      console.log(`Generate: We have some mixed or empty props.`);
      return;
    }

    if (!idMatch && !nameMatch) {
      this.createStyle(layer);
      counter.created++;
    } else if (idMatch && !nameMatch) {
      this.renameStyle(layer, idMatch);
      counter.renamed++;
    } else if (idMatch !== nameMatch) {
      this.updateStyle(layer, nameMatch);
      counter.updated++;
    } else {
      counter.ignored++;
    }
  };

  isPropEmpty = (layer: SceneNode) => isArrayEmpty(layer[this.layerProps[0]]);
  isPropMixed = (layer: SceneNode) => this.layerProps.some((prop) => layer[prop] === figma.mixed);
}

export const changeStyles = () => {
  const selection = cleanSelection();

  if (isArrayEmpty(selection)) {
    figmaNotifyAndClose(messages.selection.empty, NOTIFICATION_TIMEOUT);
    return;
  }

  selection.map((layer) => {
    if (layer.type === 'TEXT') {
      (async () => {
        await figma.loadFontAsync(layer.fontName as FontName);

        [texter].map((styler) => {
          tempName(layer, styler);
        });
      })();
    } else {
      stylers.map((styler) => {
        tempName(layer, styler);
      });
    }
  });
  console.log(counter);
};

function tempName(layer, styler) {
  const idMatch = styler.getStyleById(layer);
  const nameMatch = styler.getStyleByName(layer.name);

  if (CMD === 'generate-styles') {
    styler.generateStyle(layer, { nameMatch, idMatch });
  } else if (CMD === 'apply-styles') {
    styler.applyStyle(layer, nameMatch);
  } else if (CMD === 'detach-styles') {
    styler.detachStyle(layer);
  }
}

/* 


export const generateAllLayerStyles = (layers) => {
  const counter = {
    created: 0,
    ignored: 0,
    renamed: 0,
    updated: 0,
  };

  layers.map((layer) => {
    // stylers are the links between layers and styles that are created by figma code inconsistency or design decision itself (which are not bad and simply exist)

    stylers.map(async (styler) => {
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
    figmaNotifyAndClose(`😭 We do not support empty or mixed properties. Oh, Noo...`, NOTIFICATION_TIMEOUT);
    return;
  }
  figmaNotifyAndClose(
    `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      🌈 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
    NOTIFICATION_TIMEOUT,
  );
};

export const removeAllLayerStyles = (layers) => {
  let counter = 0;

  layers.map((layer) => {
    stylers.map((styler) => {
      const idMatch = styler.getStyleById(layer);
      if (!idMatch) return;

      idMatch.remove();
      counter++;
    });
  });

  if (counter === 0) {
    figmaNotifyAndClose(
      `🤔 No style was applied on any of the selected layers. Yep, it's not weird...`,
      NOTIFICATION_TIMEOUT,
    );
    return;
  }
  figmaNotifyAndClose(`🔥 Removed ${counter} styles. Rrr...`, NOTIFICATION_TIMEOUT);
};

export const removeLayerStylesByType = (layers, CMD) => {
  let counter = 0;
  const removeType = CMD.split('-')[1];

  layers.map((layer) => {
    stylers
      .filter((styler) => styler.layerPropType === removeType.toLocaleUpperCase())
      .map((styler) => {
        const idMatch = styler.getStyleById(layer);
        if (!idMatch) return;

        idMatch.remove();
        counter++;
      });
  });

  if (counter === 0) {
    figmaNotifyAndClose(
      `🤔 No ${removeType} style was applied on any of the selected layers. Whaa...`,
      NOTIFICATION_TIMEOUT,
    );
    return;
  }
  figmaNotifyAndClose(`🔥 Removed ${counter} ${removeType} styles. Ups...`, NOTIFICATION_TIMEOUT);
}; */

export const getAllUniqueStylesName = (styles): string[] => {
  const allStylesName = styles.map((style) => style.name);
  const affixes = stylers
    .map((styler) => [styler.prefix, styler.suffix])
    .flat()
    .filter(Boolean)
    .join('|');
  const regexAffixes = new RegExp('\\b(?:' + affixes + ')\\b', 'g');

  const namesWithoutAffixes = allStylesName.map((style) => style.replace(regexAffixes, ''));

  return uniq(namesWithoutAffixes) as string[];
};

export const getAllStylesByName = (name) => {
  const collectedStyles = [];

  stylers.map((styler) => {
    const style = styler.getStyleByName(name);
    const layerPropType = styler.layerPropType;

    if (isArrayEmpty(style)) return;

    collectedStyles.push({ layerPropType, style });
  });

  return collectedStyles;
};

export const getStylesheets = (styles) => {
  const uniqueStylesNames = getAllUniqueStylesName(styles);

  return uniqueStylesNames.map((name) => {
    const collectedStyles = getAllStylesByName(name);
    const type = collectedStyles.some(({ style }) => style.type === 'TEXT') ? 'TEXT' : 'FRAME';

    return {
      name,
      type,
      collectedStyles,
    };
  });
};

export const extractAllStyles = () => {
  const styles = [
    ...figma.getLocalPaintStyles(),
    ...figma.getLocalEffectStyles(),
    ...figma.getLocalGridStyles(),
    ...figma.getLocalTextStyles(),
  ];
  let counter = 0;

  if (isArrayEmpty(styles)) {
    figmaNotifyAndClose(`😵 There is no style in this file. Ouch...`, NOTIFICATION_TIMEOUT);
    return;
  }

  let selection = [];

  editObjectColor(figma.currentPage, 'backgrounds', colors.black);
  const stylesheetsByType = groupBy(getStylesheets(styles), 'type');

  const mainContainer = createFrameLayer({
    layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
    color: colors.transparent,
  });

  const textsContainer = createFrameLayer({
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
    color: colors.transparent,
    parent: mainContainer,
  });

  const visualsContainer = createFrameLayer({
    layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
    color: colors.transparent,
    parent: mainContainer,
  });

  [...stylesheetsByType.TEXT].map(async (stylesheet) => {
    const newLayer = figma.createText();
    await figma.loadFontAsync(newLayer.fontName as FontName);

    stylesheet.collectedStyles.map(({ layerPropType, style }) => {
      if (texter.layerPropType !== layerPropType) return;

      texter.applyStyle(newLayer, style);
    });

    newLayer.characters = stylesheet.name;
    editObjectColor(newLayer, 'fills', colors.white);
    textsContainer.appendChild(newLayer);
    selection.push(newLayer);
    counter++;
  });

  chunk([...stylesheetsByType.FRAME], 3).map((stylesheets) => {
    const chunkContainer = createFrameLayer({
      layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
      color: colors.transparent,
      parent: visualsContainer,
    });

    stylesheets.map((stylesheet) => {
      const newLayer = figma.createFrame();

      stylesheet.collectedStyles.map(({ layerPropType, style }) =>
        stylers.map((styler) => {
          if (styler.layerPropType !== layerPropType) return;

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
    figmaNotifyAndClose(`😺 Created ${counter} layers. Uhuu...`, NOTIFICATION_TIMEOUT);
  }, 1000);
};
