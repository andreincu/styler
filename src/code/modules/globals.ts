import { Styler } from './styler';
import { cleanSelection } from './layers';

/* 
--- CONSTANTS
 */
export const CMD = figma.command;

/* 
--- VARIABLES
*/

export let selection = cleanSelection(); // doesn't have ssense here
// those variables can be an object called defaultSettings
export let addPreviousStyleToDescription = false; // addPrevToDescription
export let updateUsingLocalStyles = false;
export let framesPerContainer = 5; // framesPerRow
export let notificationTimeout = 6000;
export const counter = {
  applied: 0,
  created: 0,
  detached: 0,
  extracted: 0,
  generated: 0,
  ignored: 0,
  renamed: 0,
  removed: 0,
  updated: 0,
};

export const settings = {
  addPrevToDescription: false,
  framesPerContainer: 5,
  notificationTimeout: 6000,
  updateUsingLocalStyles: false,

  // stylers
  fillerPrefix: '',
  fillerSuffix: '',
  strokeerPrefix: '',
  strokeerSuffix: '-stroke',
  effecterPrefix: '',
  effecterSuffix: '',
  griderPrefix: '',
  griderSuffix: '',
  texterPrefix: '',
  texterSuffix: '',
};

/* 
--- STYLERS
 */

export const filler = new Styler({
  name: 'filler',
  styleType: 'paint',
  styleProps: ['paints'],
  layerProps: ['fills'],
  layerPropType: 'fill',
  // prefix: settings.fillerPrefix,
  // suffix: settings.fillerSuffix,
});
export const strokeer = new Styler({
  name: 'strokeer',
  styleType: 'paint',
  styleProps: ['paints'],
  layerProps: ['strokes'],
  layerPropType: 'stroke',
  suffix: '-stroke', // here it will be a variable in the future
});
export const effecter = new Styler({
  name: 'effecter',
  styleType: 'effect',
  styleProps: ['effects'],
});
export const grider = new Styler({
  name: 'grider',
  styleType: 'grid',
  styleProps: ['layoutGrids'],
});
export const texter = new Styler({
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
});

export const allStylers = [texter, grider, filler, strokeer, effecter];
export const stylersWithoutTexter = [grider, filler, strokeer, effecter];

/* 
--- COLORS
 */
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };

/* 
--- client storage
*/

export const clientStorageKey = 'codeSettings';

export const changeGlobals = (settings: any = {}) => {
  allStylers.map((styler) => {
    const stylerName = styler.name;
    styler.prefix = settings[stylerName]?.prefix || styler.prefix;
    styler.suffix = settings[stylerName]?.suffix || styler.suffix;
  });

  notificationTimeout = settings.notificationTimeout || notificationTimeout;
  framesPerContainer = settings.framesPerContainer || framesPerContainer;
  addPreviousStyleToDescription = settings.addPreviousStyleToDescription || addPreviousStyleToDescription;
  updateUsingLocalStyles = settings.updateUsingLocalStyles || updateUsingLocalStyles;
};
