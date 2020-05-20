import { Styler } from './styles';

/* 
--- CONSTANTS
 */
export const CMD = figma.command;

/* 
--- VARIABLES
*/
export let notificationTimeout = 6000;
export let framesPerContainer = 5;
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

/* 
--- STYLERS
 */
export const filler = new Styler({
  styleType: 'paint',
  styleProps: ['paints'],
  layerProps: ['fills'],
  layerPropType: 'fill',
  suffix: '', // here it will be a variable in the future
});
export const strokeer = new Styler({
  styleType: 'paint',
  styleProps: ['paints'],
  layerProps: ['strokes'],
  layerPropType: 'stroke',
  suffix: '-stroke', // here it will be a variable in the future
});
export const effecter = new Styler({
  styleType: 'effect',
  styleProps: ['effects'],
});
export const grider = new Styler({
  styleType: 'grid',
  styleProps: ['layoutGrids'],
});
export const texter = new Styler({
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

export const allStylers = [filler, strokeer, effecter, grider, texter];
export const stylersWithoutTexter = [filler, strokeer, effecter, grider];

/* 
--- COLORS
 */
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };
