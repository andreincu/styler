import { clone, isArrayEmpty } from './common';

// avoiding layers that have mixed properties
const isContainer = (layer) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(layer.type);
const isShape = (layer) => ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR'].includes(layer.type);
const isText = (layer) => layer.type === 'TEXT';

// cleanup selection
export const cleanLayers = (layers) => {
  return layers.filter((layer) => isContainer(layer) || isShape(layer) || isText(layer));
};

// edit layer fill property
export const editLayerFill = (layer, red = 0, green = 0, blue = 0) => {
  const cloned = clone(layer.fills);

  cloned[0].color = {
    r: red,
    g: green,
    b: blue,
  };
  return (layer.fills = cloned);
};

// edit canvas background
export const editCanvasBg = (red = 0, green = 0, blue = 0) => {
  const canvasBg = clone(figma.currentPage.backgrounds);

  canvasBg[0].color = {
    r: red,
    g: green,
    b: blue,
  };

  return (figma.currentPage.backgrounds = canvasBg);
};

// set frame to Auto-Layout
export const setAutoFlow = (
  frame,
  direction: FrameNode['layoutMode'] = 'HORIZONTAL',
  alignment: FrameNode['layoutAlign'] = 'MIN',
  axisMode: FrameNode['counterAxisSizingMode'] = 'AUTO',
  paddingX = 0,
  paddingY = 0,
  gutter = 0,
) => {
  frame.layoutMode = direction;
  frame.layoutAlign = alignment;
  frame.counterAxisSizingMode = axisMode;
  frame.horizontalPadding = paddingX;
  frame.verticalPadding = paddingY;
  frame.itemSpacing = gutter;

  return frame;
};

export const hasFillAndStroke = (layer) => !isArrayEmpty(layer.fills) && !isArrayEmpty(layer.strokes);
