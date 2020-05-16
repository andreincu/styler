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
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  autoLayoutProps?: AutoLayoutProps;
  parent?: ChildrenMixin;
}
