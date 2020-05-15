import { clone, isArrayEmpty } from './common';
import { hexToFigmaRGB } from './convert-color';

// avoiding layers that have mixed properties
const isContainer = (layer) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(layer.type);
const isShape = (layer) => ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR'].includes(layer.type);
const isText = (layer) => layer.type === 'TEXT';

// cleanup selection
export const cleanLayers = (layers) => {
  layers.map((layer) => console.log(layer.name));
  return layers.filter((layer) => isContainer(layer) || isShape(layer) || isText(layer));
};

// edit layer fill property
export const editObjectColor = (layer, prop, hex = '#000000') => {
  const cloned = clone(layer[prop]);

  cloned[0].color = hexToFigmaRGB(hex);
  return (layer[prop] = cloned);
};

// {direction: FrameNode['layoutMode'] = 'HORIZONTAL',
// alignment: FrameNode['layoutAlign'] = 'MIN',
// axisMode: FrameNode['counterAxisSizingMode'] = 'AUTO',
// paddingX = 0,
// paddingY = 0,
// gutter = 0,}
// set frame to Auto-Layout
export const setAutoFlow = (
  frame,
  options: {
    direction?: FrameNode['layoutMode'];
    alignment?: FrameNode['layoutAlign'];
    axisMode?: FrameNode['counterAxisSizingMode'];
    paddingX?: number;
    paddingY?: number;
    gutter?: number;
  },
) => {
  const {
    direction = 'HORIZONTAL',
    alignment = 'MIN',
    axisMode = 'AUTO',
    paddingX = 0,
    paddingY = 0,
    gutter = 0,
  } = options;

  frame.layoutMode = direction;
  frame.layoutAlign = alignment;
  frame.counterAxisSizingMode = axisMode;
  frame.horizontalPadding = paddingX;
  frame.verticalPadding = paddingY;
  frame.itemSpacing = gutter;

  return frame;
};

export const hasFillAndStroke = (layer) => !isArrayEmpty(layer.fills) && !isArrayEmpty(layer.strokes);

// ungroup layer
export const ungroup = (layer) => {
  const parent = layer.parent;
  const parentOfParent = parent.parent;

  layer.x = parent.x + layer.relativeTransform[0][2];
  layer.y = parent.y + layer.relativeTransform[1][2];
  parentOfParent.appendChild(layer);

  if (parent.children.length === 0) parent.remove();
};

// ungroup all layers
export const ungroupAll = (layers) => {
  layers.map((layer) => ungroup(layer));
};
