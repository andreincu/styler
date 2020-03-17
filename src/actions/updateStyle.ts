// sync layer style with shared style
export default (localStyle, layer) => localStyle.paints = layer.fills;