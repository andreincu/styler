import { Styler } from './styler';
import { defaultSettings } from './default-settings.js';

export const clientStorageKey = 'codeSettings';

export class Config {
  // general
  addPrevToDescription: boolean;
  framesPerRow: number;
  notificationTimeout: number;
  updateUsingLocalStyles: boolean;
  partialMatch: boolean,

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
      partialMatch = defaultSettings.partialMatch,

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
    this.partialMatch = partialMatch;

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
