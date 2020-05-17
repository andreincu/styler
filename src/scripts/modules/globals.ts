import { Styler } from './styler';

/* 
--- CONSTANTS
 */
export const CMD = figma.command;
export const NOTIFICATION_TIMEOUT = 8000;

/* 
--- VARIABLES
 */
export const counter = {
  applied: 0,
  created: 0,
  detached: 0,
  extracted: 0,
  ignored: 0,
  renamed: 0,
  removed: 0,
  updated: 0,
};

export const messages = {
  applied: {
    empty: `🤔 There is no style that has this layer name. Maybe? Renam...`,
    default: `✌️ Applied ${counter.applied} styles. He he...`,
  },
  detached: {
    empty: `🤔 No style was applied on any of the selected layers. Idk...`,
    default: `💔 Detached ${counter.detached} styles. Layers will miss you...`,
  },
  extracted: {
    empty: `😵 There is no style in this file. Ouch...`,
    default: `😺 Created ${counter.extracted} layers. Uhuu...`,
  },
  generate: {
    empty: `😭 We do not support empty or mixed properties. Oh, Noo...`,
    default: `
    🔨 Created: ${counter.created} -
    ✨ Updated: ${counter.updated} -
    🌈 Renamed: ${counter.renamed} -
    😶 No changes: ${counter.ignored}
    `,
  },
  removed: {
    empty: `🤔 No style was applied on any of the selected layers. Yep, it's not weird...`,
    default: `🔥 Removed ${counter.removed} styles. Rrr...`,
  },
  selection: {
    empty: `🥰 You must select at least 1 layer. Yea...`,
  },
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

export const stylers = [filler, strokeer, effecter, grider];
export const stylersWithTexter = [...stylers, texter];

/* 
--- COLORS
 */
export const white = [255, 255, 255, 1];
export const black = [0, 0, 0, 1];
export const transparent = [0, 0, 0, 0];

export const colors = { white, black, transparent };
