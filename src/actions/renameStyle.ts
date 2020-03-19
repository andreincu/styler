import fixName from "../utils/fixName";

// sync layer style with shared style
export default (localStyle, layer) => localStyle.name = fixName(layer);
