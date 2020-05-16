import { Styler } from '../styler';

// this is the timeout for all notification alerts
export const TIMEOUT = 8000;
export const CMD = figma.command;

// creating each style one by one
export const filler = new Styler({
  styleType: 'paint',
  styleProperties: ['paints'],
  layerProperties: ['fills'],
  layerPropertyType: 'fill',
  suffix: '', // here it will be a variable in the future
});
export const strokeer = new Styler({
  styleType: 'paint',
  styleProperties: ['paints'],
  layerProperties: ['strokes'],
  layerPropertyType: 'stroke',
  suffix: '-stroke', // here it will be a variable in the future
});
export const effecter = new Styler({
  styleType: 'effect',
  styleProperties: ['effects'],
});
export const grider = new Styler({
  styleType: 'grid',
  styleProperties: ['layoutGrids'],
});
export const texter = new Styler({
  styleType: 'text',
  styleProperties: [
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

export const stylers = [filler, strokeer, effecter, grider, texter];

// colors
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };
