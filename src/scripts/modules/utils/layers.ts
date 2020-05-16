import { clone } from './common';
import { webRGBToFigmaRGB } from './convert-color';

interface AutoLayoutProps {
  layoutMode?: FrameNode['layoutMode'];
  layoutAlign?: FrameNode['layoutAlign'];
  counterAxisSizingMode?: FrameNode['counterAxisSizingMode'];
  horizontalPadding?: FrameNode['horizontalPadding'];
  verticalPadding?: FrameNode['verticalPadding'];
  itemSpacing?: FrameNode['itemSpacing'];
}

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
export const editObjectColor = (layer, prop, rgba: number[]) => {
  const color = webRGBToFigmaRGB(rgba);
  const { r = 0, g = 0, b = 0, a = 1 } = color;

  const cloned = clone(layer[prop]);

  cloned[0].color = { r, g, b };
  cloned[0].opacity = a;

  return (layer[prop] = cloned);
};

export const setAutoLayout = (frame: FrameNode, options?: AutoLayoutProps) => {
  const {
    layoutMode = 'NONE',
    layoutAlign = 'MIN',
    counterAxisSizingMode = 'AUTO',
    horizontalPadding = 0,
    verticalPadding = 0,
    itemSpacing = 0,
  } = options;

  frame.layoutMode = layoutMode;
  frame.layoutAlign = layoutAlign;
  frame.counterAxisSizingMode = counterAxisSizingMode;
  frame.horizontalPadding = horizontalPadding;
  frame.verticalPadding = verticalPadding;
  frame.itemSpacing = itemSpacing;

  return frame;
};

export const createFrameLayer = (options?: {
  color?: number[];
  position?: { x: number; y: number };
  autoLayoutProps?: AutoLayoutProps;
}) => {
  const { color, position = { x: 0, y: 0 }, autoLayoutProps } = options;

  const newLayer = figma.createFrame();
  editObjectColor(newLayer, 'fills', color || [0, 0, 0]);
  setAutoLayout(newLayer, autoLayoutProps);
  newLayer.x = position.x;
  newLayer.y = position.y;

  return newLayer;
};

// ungroup layer
export const ungroup = (layer) => {
  const parent = layer.parent;
  if (parent.type === 'PAGE') return;
  setAutoLayout(parent, { layoutMode: 'NONE' });

  const parentOfParent = parent.parent;
  if (parentOfParent.type !== 'PAGE') {
    setAutoLayout(parentOfParent, { layoutMode: 'NONE' });
  }

  layer.x = parent.x + layer.relativeTransform[0][2];
  layer.y = parent.y + layer.relativeTransform[1][2];
  parentOfParent.appendChild(layer);

  if (parent.children.length === 0) parent.remove();
};

// ungroup all layers
export const ungroupEachToCanvas = (layers) => {
  let numberOfLayers = layers.length;
  while (numberOfLayers > 0) {
    layers.map((layer) => {
      if (layer.parent.type === 'PAGE') {
        numberOfLayers -= 1;
        return;
      }
      ungroup(layer);
    });
  }
};
