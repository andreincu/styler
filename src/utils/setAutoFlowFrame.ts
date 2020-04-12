// set frame to Auto-Layout
export default (
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
