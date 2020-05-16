import { clone } from './utils';
import { webRGBToFigmaRGB } from './convert-color';
import { colors } from './globals';

interface AutoLayoutProps {
  layoutMode?: FrameNode['layoutMode'];
  layoutAlign?: FrameNode['layoutAlign'];
  counterAxisSizingMode?: FrameNode['counterAxisSizingMode'];
  horizontalPadding?: FrameNode['horizontalPadding'];
  verticalPadding?: FrameNode['verticalPadding'];
  itemSpacing?: FrameNode['itemSpacing'];
}

export interface FrameLayer {
  color?: number[];
  layoutProps?: AutoLayoutProps;
  parent?: ChildrenMixin;
  position?: { x?: number; y?: number };
  size?: { width?: number; height?: number };
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
export const editObjectColor = (layer, prop, rgba = [0, 0, 0, 1]) => {
  const color = webRGBToFigmaRGB(rgba);
  const { r, g, b, a } = color;

  const cloned = clone(layer[prop]);

  cloned[0].color = { r, g, b };
  cloned[0].opacity = a;

  return (layer[prop] = cloned);
};

export const setAutoLayout = (frame: FrameNode, options: AutoLayoutProps) => {
  let { layoutMode, layoutAlign, counterAxisSizingMode, horizontalPadding, verticalPadding, itemSpacing } = options;

  frame.layoutMode = layoutMode || 'VERTICAL';
  frame.layoutAlign = layoutAlign || 'MIN';
  frame.counterAxisSizingMode = counterAxisSizingMode || 'AUTO';
  frame.horizontalPadding = horizontalPadding || 0;
  frame.verticalPadding = verticalPadding || 0;
  frame.itemSpacing = itemSpacing || 0;
};

export const createFrameLayer = async (options: FrameLayer = {}) => {
  let {
    layoutProps,
    color = colors.black,
    position = { x: 0, y: 0 },
    size = { width: 80, height: 80 },
    parent = figma.currentPage,
  } = options;

  layoutProps.layoutMode = layoutProps.layoutMode || 'VERTICAL';
  layoutProps.layoutAlign = layoutProps.layoutAlign || 'MIN';
  layoutProps.counterAxisSizingMode = layoutProps.counterAxisSizingMode || 'AUTO';
  layoutProps.horizontalPadding = layoutProps.horizontalPadding || 0;
  layoutProps.verticalPadding = layoutProps.verticalPadding || 0;
  layoutProps.itemSpacing = layoutProps.itemSpacing || 0;

  const newLayer = figma.createFrame();

  editObjectColor(newLayer, 'fills', color);
  newLayer.x = position.x;
  newLayer.y = position.y;

  newLayer.resize(size.width, size.height);
  setAutoLayout(newLayer, layoutProps);

  parent.appendChild(newLayer);

  return await newLayer;
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
