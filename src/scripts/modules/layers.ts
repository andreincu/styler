import { clone, groupBy } from './utils';
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
  xPos?: number;
  yPos?: number;
  width?: number;
  height?: number;
}

// avoiding layers that have mixed properties
const isContainer = (layer) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(layer.type);
const isShape = (layer) => ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR'].includes(layer.type);
const isText = (layer) => layer.type === 'TEXT';

const excludeGroups = (layers) => layers.filter((layer) => isContainer(layer) || isShape(layer) || isText(layer));

// edit layer fill property
export const editObjectColor = (layer, prop, rgba = [0, 0, 0, 1]) => {
  const color = webRGBToFigmaRGB(rgba);
  const { r, g, b, a } = color;

  const cloned = clone(layer[prop]);

  cloned[0].color = { r, g, b };
  cloned[0].opacity = a;

  return (layer[prop] = cloned);
};

export const setAutoLayout = (frame: FrameNode, options: AutoLayoutProps = {}) => {
  const {
    layoutMode = 'VERTICAL',
    layoutAlign = 'MIN',
    counterAxisSizingMode = 'AUTO',
    horizontalPadding = 0,
    verticalPadding = 0,
    itemSpacing = 0,
  } = options;

  if (!frame) {
    return;
  }

  frame.layoutMode = layoutMode;
  frame.layoutAlign = layoutAlign;
  frame.counterAxisSizingMode = counterAxisSizingMode;
  frame.horizontalPadding = horizontalPadding;
  frame.verticalPadding = verticalPadding;
  frame.itemSpacing = itemSpacing;

  return frame;
};

export const createFrameLayer = (options: FrameLayer = {}) => {
  let {
    layoutProps = {},
    color = colors.black,
    xPos = 0,
    yPos = xPos,
    width = 80,
    height = width,
    parent = figma.currentPage,
  } = options;

  const newLayer = figma.createFrame();

  newLayer.x = xPos;
  newLayer.y = yPos;
  newLayer.resize(width, height);
  editObjectColor(newLayer, 'fills', color);

  parent.appendChild(newLayer);

  setAutoLayout(newLayer, layoutProps);

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

/* 
--- clean Selection
--- remove unwanted layers from array
--- reorder layers to be sorted as in layer panel 
*/
export const cleanSelection = (): SceneNode[] => {
  const selection = excludeGroups(figma.currentPage.selection);
  const selectionByParent = Object.values(groupBy(selection, 'parent'));
  const layers: any = [];

  selectionByParent.map((group: []) => {
    const orderedGroup: SceneNode[] = [...group].sort((current: any, next: any) => {
      return current.parent.children.indexOf(current) - next.parent.children.indexOf(next);
    });
    layers.push(orderedGroup);
  });

  return layers.flat();
};
