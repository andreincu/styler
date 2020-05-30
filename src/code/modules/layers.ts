import { clone, groupBy, isArrayEmpty } from './utils';
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

export const changeLayoutProps = (frame: FrameNode, options: AutoLayoutProps = {}) => {
  const {
    layoutMode = 'NONE',
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

export const createTextLayer = async (options: TextLayer = {}) => {
  const {
    characters = 'Text',
    color = colors.transparent,
    parent = figma.currentPage,
    xPos = 0,
    yPos = xPos,
  } = options;

  const newLayer = figma.createText();
  await figma.loadFontAsync(newLayer.fontName as FontName);

  newLayer.characters = characters;
  newLayer.x = xPos;
  newLayer.y = yPos;

  changeColor(newLayer, 'fills', color);
  parent.appendChild(newLayer);

  return newLayer;
};

export const createFrameLayer = (options: FrameLayer = {}) => {
  const {
    color = colors.transparent,
    layoutProps = {},
    name = 'Container',
    parent = figma.currentPage,
    size = 80,
    width = size,
    height = width,
    xPos = 0,
    yPos = xPos,
  } = options;

  const newLayer = figma.createFrame();
  newLayer.resize(width, height);

  newLayer.x = xPos;
  newLayer.y = yPos;
  newLayer.name = name;
  changeColor(newLayer, 'fills', color);

  parent.appendChild(newLayer);

  changeLayoutProps(newLayer, layoutProps);

  return newLayer;
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
