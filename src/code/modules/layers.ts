import { webRGBToFigmaRGB } from './convert-color';
import { colors } from './globals';
import { clone, groupBy } from './utils';

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
  name?: string;
  xPos?: number;
  size?: number;
  yPos?: number;
  width?: number;
  height?: number;
}

export interface TextLayer {
  characters?: string;
  color?: number[];
  parent?: any;
  xPos?: number;
  yPos?: number;
}

const isContainer = (layer) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(layer.type);
const isShape = (layer) => ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR'].includes(layer.type);
const isText = (layer) => layer.type === 'TEXT';

const excludeGroups = (layers) => layers.filter((layer) => isContainer(layer) || isShape(layer) || isText(layer));

export const changeColor = (layer, prop, rgba = [0, 0, 0, 1]) => {
  const color = webRGBToFigmaRGB(rgba);
  const { r, g, b, a } = color;

  const cloned = clone(layer[prop]);

  cloned[0].color = { r, g, b };
  cloned[0].opacity = a;

  return (layer[prop] = cloned);
};

export const changeLayoutProps = (targetedFrame: FrameNode, options: AutoLayoutProps = {}) => {
  const {
    layoutMode = 'NONE',
    layoutAlign = 'MIN',
    counterAxisSizingMode = 'AUTO',
    horizontalPadding = 0,
    verticalPadding = 0,
    itemSpacing = 0,
  } = options;

  if (!targetedFrame) {
    return;
  }

  targetedFrame.layoutMode = layoutMode;
  targetedFrame.layoutAlign = layoutAlign;
  targetedFrame.counterAxisSizingMode = counterAxisSizingMode;
  targetedFrame.horizontalPadding = horizontalPadding;
  targetedFrame.verticalPadding = verticalPadding;
  targetedFrame.itemSpacing = itemSpacing;

  return targetedFrame;
};

export const createTextLayer = async (name = 'TextLayer', parent = figma.currentPage, options: TextLayer = {}) => {
  const { color = colors.transparent, xPos = 0, yPos = xPos } = options;

  const newLayer = figma.createText();
  await figma.loadFontAsync(newLayer.fontName as FontName);

  newLayer.name = name;
  newLayer.characters = name;
  if (color) {
    changeColor(newLayer, 'fills', color);
  }

  newLayer.x = xPos;
  newLayer.y = yPos;

  parent.appendChild(newLayer);

  return newLayer;
};

export const createFrameLayer = (
  name = 'FrameLayer',
  parent: FrameNode | PageNode = figma.currentPage,
  options: FrameLayer = {},
) => {
  const {
    color = colors.transparent,
    layoutProps = {},
    size = 80,
    width = size,
    height = width,
    xPos = 0,
    yPos = xPos,
  } = options;

  const newLayer = figma.createFrame();
  newLayer.name = name;
  if (color) {
    changeColor(newLayer, 'fills', color);
  }

  newLayer.x = xPos;
  newLayer.y = yPos;
  newLayer.resize(width, height);

  parent.appendChild(newLayer);

  changeLayoutProps(newLayer, layoutProps);

  return newLayer;
};

export const createLayer = (
  name = 'Layer',
  parent: FrameNode | PageNode = figma.currentPage,
  layerType = 'PAINT',
  options = {},
) => {
  const createCommand = {
    TEXT: createTextLayer,
    GRID: createFrameLayer,
    PAINT: createFrameLayer,
    EFFECT: createFrameLayer,
  };

  return createCommand[layerType](name, parent, options);
};

// ungroup layer
export const ungroup = (layer) => {
  const layerParent = layer.parent;
  const layerGrandParent = layerParent.parent;

  if (layerParent.type !== 'PAGE') {
    changeLayoutProps(layerParent, { layoutMode: 'NONE' });
  }
  if (layerGrandParent.type !== 'PAGE') {
    changeLayoutProps(layerGrandParent, { layoutMode: 'NONE' });
  }

  layerGrandParent.appendChild(layer);

  layer.x = layerParent.x + layer.relativeTransform[0][2];
  layer.y = layerParent.y + layer.relativeTransform[1][2];

  if (layerParent.children.length === 0) layerParent.remove();
};

// ungroup all layers
export const ungroupToCanvas = (layers: SceneNode[]) => {
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
