import { Styler } from './modules/Styler';

export class Config {
  // general
  addPrevToDescription: boolean;
  framesPerSection: number;
  textsPerSection: number;
  notificationTimeout: number;
  updateUsingLocalStyles: boolean;
  partialMatch: boolean;

  // stylers
  texter: Styler;
  grider: Styler;
  filler: Styler;
  strokeer: Styler;
  effecter: Styler;
  allStylers: Styler[];
  stylersWithoutTexter: Styler[];
  texterOnly: Styler[];

  constructor(options) {
    const {
      // general
      addPrevToDescription,
      framesPerSection,
      textsPerSection,
      notificationTimeout,
      updateUsingLocalStyles,
      partialMatch,

      // stylers
      texterPrefix,
      texterSuffix,
      griderPrefix,
      griderSuffix,
      fillerPrefix,
      fillerSuffix,
      strokeerPrefix,
      strokeerSuffix,
      effecterPrefix,
      effecterSuffix,
    } = options;

    this.addPrevToDescription = addPrevToDescription;
    this.framesPerSection = framesPerSection;
    this.textsPerSection = textsPerSection;
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

    this.allStylers = [this.texter, this.filler, this.strokeer, this.effecter, this.grider];
    this.stylersWithoutTexter = [this.filler, this.strokeer, this.effecter, this.grider];
    this.texterOnly = [this.texter];
  }
}
