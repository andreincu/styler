import { clone } from './common';
import { webRGBToFigmaRGB } from './convert-color';
import { colors } from './globals';

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
export const editObjectColor = (layer, prop, rgba = [0, 0, 0, 1]) => {
  const color = webRGBToFigmaRGB(rgba);
  const { r, g, b, a } = color;

  const cloned = clone(layer[prop]);

  cloned[0].color = { r, g, b };
  cloned[0].opacity = a;

  return (layer[prop] = cloned);
};

export const setAutoLayout = (
  frame: FrameNode,
  options: AutoLayoutProps = {
    layoutMode: 'NONE',
    layoutAlign: 'MIN',
    counterAxisSizingMode: 'AUTO',
    horizontalPadding: 0,
    verticalPadding: 0,
    itemSpacing: 0,
  },
) => {
  const { layoutMode, layoutAlign, counterAxisSizingMode, horizontalPadding, verticalPadding, itemSpacing } = options;

  frame.layoutMode = layoutMode;
  frame.layoutAlign = layoutAlign;
  frame.counterAxisSizingMode = counterAxisSizingMode;
  frame.horizontalPadding = horizontalPadding;
  frame.verticalPadding = verticalPadding;
  frame.itemSpacing = itemSpacing;

  return frame;
};

export const createFrameLayer = (
  options: FrameLayer = {
    color: colors.black,
    size: { width: 80, height: 80 },
    position: { x: 0, y: 0 },
    parent: figma.currentPage,
  },
) => {
  const { color, size, position, autoLayoutProps, parent } = options;
  const { width, height } = size;

  const newLayer = figma.createFrame();
  editObjectColor(newLayer, 'fills', color);
  setAutoLayout(newLayer, autoLayoutProps);
  newLayer.x = position.x;
  newLayer.y = position.y;
  newLayer.resize(width, height);
  parent.appendChild(newLayer);

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
