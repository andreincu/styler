import {
  NOTIFICATION_TIMEOUT,
  colors,
  texter,
  stylers,
  counter,
  CMD,
  filler,
  strokeer,
  effecter,
  grider,
} from './globals';
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

  removeStyle = (style: BaseStyle) => {
    if (!style) {
      return;
    }

    const cmdType = CMD.split('-')[1];
    if (cmdType === this.layerPropType.toLocaleLowerCase() || cmdType === 'all') {
      style.remove();
      counter.removed++;
    }
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
    counter.generated++;
  };

  isPropEmpty = (layer: SceneNode) => isArrayEmpty(layer[this.layerProps[0]]);
  isPropMixed = (layer: SceneNode) => this.layerProps.some((prop) => layer[prop] === figma.mixed);
}

export const showMessage = (counter, messages: any = {}) => {
  const { empty = '', single = '', multiple = '' } = messages;

  if (counter === 0) {
    figmaNotifyAndClose(empty, NOTIFICATION_TIMEOUT);
  } else if (counter === 1) {
    figmaNotifyAndClose(single, NOTIFICATION_TIMEOUT);
  } else {
    figmaNotifyAndClose(multiple, NOTIFICATION_TIMEOUT);
  }
};

export const showStyleNofication = () => {
  const generateMessage = `
    🔨 Created: ${counter.created} -
    ✨ Updated: ${counter.updated} -
    🌈 Renamed: ${counter.renamed} -
    😶 No changes: ${counter.ignored}
  `;

  const messages = {
    applied: {
      empty: `🤔 There is no style that has this layer name. Maybe? Renam...`,
      single: `✌️ Applied only ${counter.applied} style. He he...`,
      multiple: `✌️ Applied ${counter.applied} styles. He he...`,
    },
    detached: {
      empty: `🤔 No style was applied on any of the selected layers. Idk...`,
      single: `💔 Detached only ${counter.detached} style. Layers will miss you...`,
      multiple: `💔 Detached ${counter.detached} styles. Layers will miss you...`,
    },
    extracted: {
      empty: `😵 There is no style in this file. Ouch...`,
      single: `😺 Created only ${counter.extracted} layer. Uhuu...`,
      multiple: `😺 Created ${counter.extracted} layers. Uhuu...`,
    },
    generated: {
      empty: `😭 We do not support empty or mixed properties. Oh, Noo...`,
      single: generateMessage,
      multiple: generateMessage,
    },
    removed: {
      empty: `🤔 No style was applied on any of the selected layers. Yep, it's not weird...`,
      single: `🔥 Removed only ${counter.removed} style. Rrr...`,
      multiple: `🔥 Removed ${counter.removed} styles. Rrr...`,
    },
  };

  if (CMD === 'generate-all-styles') {
    showMessage(counter.generated, messages.generated);
  } else if (CMD === 'apply-all-styles') {
    showMessage(counter.applied, messages.applied);
  } else if (CMD === 'detach-all-styles') {
    showMessage(counter.detached, messages.detached);
  } else if (CMD.includes('remove')) {
    showMessage(counter.removed, messages.removed);
  }
};

export const getStylersByLayerType = (layer: SceneNode): Styler[] => {
  const stylers = [];
  if (layer.type === 'TEXT') {
    stylers.push(texter);
  } else {
    stylers.push(filler, strokeer, effecter, grider);
  }
  return stylers;
};

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
