import { defaultSettings } from './default-settings.js';
import { Styler } from './styler';

export const clientStorageKey = 'codeSettings';

export class Config {
  // general
  addPrevToDescription: boolean;
  framesPerRow: number;
  notificationTimeout: number;
  updateUsingLocalStyles: boolean;

  // stylers
  texter: Styler;
  grider: Styler;
  filler: Styler;
  strokeer: Styler;
  effecter: Styler;
  allStylers: Styler[];
  stylersWithoutTexter: Styler[];
  texterOnly: Styler[];

  constructor(options = defaultSettings) {
    const {
      // general
      addPrevToDescription = defaultSettings.addPrevToDescription,
      framesPerRow = defaultSettings.framesPerRow,
      notificationTimeout = defaultSettings.notificationTimeout,
      updateUsingLocalStyles = defaultSettings.updateUsingLocalStyles,

      // stylers
      texterPrefix = defaultSettings.texterPrefix,
      texterSuffix = defaultSettings.texterSuffix,
      griderPrefix = defaultSettings.griderPrefix,
      griderSuffix = defaultSettings.griderSuffix,
      fillerPrefix = defaultSettings.fillerPrefix,
      fillerSuffix = defaultSettings.fillerSuffix,
      strokeerPrefix = defaultSettings.strokeerPrefix,
      strokeerSuffix = defaultSettings.strokeerSuffix,
      effecterPrefix = defaultSettings.effecterPrefix,
      effecterSuffix = defaultSettings.effecterSuffix,
    } = options;

    this.addPrevToDescription = addPrevToDescription;
    this.framesPerRow = framesPerRow;
    this.notificationTimeout = notificationTimeout;
    this.updateUsingLocalStyles = updateUsingLocalStyles;

    this.texter = new Styler({
      name: 'texter',
      styleType: 'text',
      styleProps: [
        'fontName',
        'fontSize',
        'letterSpacing',
        'lineHeight',
        'paragraphIndent',
        'paragraphSpacing',
        'textCase',
        'textDecoration',
      ],
      prefix: texterPrefix,
      suffix: texterSuffix,
    });
    this.grider = new Styler({
      name: 'grider',
      styleType: 'grid',
      styleProps: ['layoutGrids'],
      prefix: griderPrefix,
      suffix: griderSuffix,
    });
    this.filler = new Styler({
      name: 'filler',
      styleType: 'paint',
      styleProps: ['paints'],
      layerProps: ['fills'],
      layerPropType: 'fill',
      prefix: fillerPrefix,
      suffix: fillerSuffix,
    });
    this.strokeer = new Styler({
      name: 'strokeer',
      styleType: 'paint',
      styleProps: ['paints'],
      layerProps: ['strokes'],
      layerPropType: 'stroke',
      prefix: strokeerPrefix,
      suffix: strokeerSuffix,
    });
    this.effecter = new Styler({
      name: 'effecter',
      styleType: 'effect',
      styleProps: ['effects'],
      prefix: effecterPrefix,
      suffix: effecterSuffix,
    });

    this.allStylers = [this.texter, this.grider, this.filler, this.strokeer, this.effecter];
    this.stylersWithoutTexter = [this.grider, this.filler, this.strokeer, this.effecter];
    this.texterOnly = [this.texter];
  }
}

export const updateStyleNames = (currentConfig, newConfigMessage) => {
  const newConfig = new Config(newConfigMessage);

  const { allStylers } = currentConfig;
  allStylers.map((styler) => {
    const styles = styler.getLocalStyles();
    if (!styles) {
      return;
    }

    const stylerName = styler.name;
    const oldPrefix = styler.prefix;
    const oldSuffix = styler.suffix;
    const newPrefix = newConfig[stylerName]?.prefix;
    const newSuffix = newConfig[stylerName]?.suffix;

    const emptySpacesFromSides = /^\s+|\s+$/g;

    styles.map((style) => {
      const styleType = checkStyleType(style, options);

      if (style.name.indexOf(oldPrefix) !== 0) {
        return;
      }

      // Sorry, future me, for styler, but I was tired :(
      if (style.type === 'PAINT') {
        if (styleType === styler.layerPropType) {
          if (newPrefix !== oldPrefix) {
            style.name = style.name.replace(oldPrefix, newPrefix).replace(emptySpacesFromSides, '');
          }
          if (newSuffix !== oldSuffix) {
            const pos = style.name.lastIndexOf(oldSuffix);
            style.name = style.name.slice(0, pos) + newSuffix;
          }
        }
      } else {
        if (newPrefix !== oldPrefix) {
          style.name = style.name.replace(oldPrefix, newPrefix).replace(emptySpacesFromSides, '');
        }
        if (newSuffix !== oldSuffix) {
          const pos = style.name.lastIndexOf(oldSuffix);
          style.name = style.name.slice(0, pos) + newSuffix;
        }
      }
    });
  });
};
