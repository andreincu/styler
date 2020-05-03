import { addAffixTo, ucFirst } from './string-utils';
import { isArrayEmpty } from './array-utils';

const toStyleId = (prop) => (prop === undefined ? undefined : addAffixTo(prop.toLocaleLowerCase(), '', 'StyleId'));

export default class Styler {
  styleType: string;
  styleProperties: Array<string>;
  layerProperties: Array<string>;
  layerPropertyType: string;
  layerStyleId: string;
  prefix: string;
  suffix: string;
  createStyleCommand: string;

  constructor(options: {
    styleType: string;
    styleProperties: Array<string>;
    layerProperties?: Array<string>;
    layerPropertyType?: string;
    prefix?: string;
    suffix?: string;
  }) {
    this.styleType = options.styleType.toLocaleUpperCase() || '';
    this.styleProperties = options.styleProperties || options.layerProperties;
    this.layerProperties = options.layerProperties || options.styleProperties;
    this.layerPropertyType = options.layerPropertyType || options.styleType;
    this.layerStyleId = toStyleId(this.layerPropertyType);
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';
  }

  applyStyle = (layer, style) => (layer[this.layerStyleId] = style.id);

  createStyle = async (layer) => {
    if (layer.type === 'TEXT') await figma.loadFontAsync(layer.fontName);

    const createCommand = addAffixTo(ucFirst(this.styleType), 'create', 'Style');
    const newStyle = figma[createCommand]();

    this.renameStyle(newStyle, layer);
    this.updateStyle(newStyle, layer);

    return newStyle;
  };

  detachStyle = (layer) => (layer[this.layerStyleId] = '');

  getLocalStyles = () => {
    const getCommand = addAffixTo(ucFirst(this.styleType), 'getLocal', 'Styles');
    return figma[getCommand]();
  };

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleId]);

  getStyleByName = (layer) => {
    const typedStyles = this.getLocalStyles();
    return typedStyles.find((style) => style.name === addAffixTo(layer.name));
  };

  renameStyle = (style, layer) => (style.name = addAffixTo(layer.name, this.prefix, this.suffix));

  removeStyle = (style, command, counter) => {
    const stylerType = addAffixTo(this.layerPropertyType, 'remove', 'styles');

    if (style && command.toLocaleLowerCase() === stylerType.toLocaleLowerCase()) {
      style.remove();
      counter.removed++;
    }
  };

  updateStyle = (style, layer) => {
    this.detachStyle(layer);
    this.layerProperties.map((prop, index) => (style[this.styleProperties[index]] = layer[prop]));
    this.applyStyle(layer, style);

    return style;
  };

  // this is something that combine multiple existing actions (create, update, rename)
  generateStyle = (layer, idMatch, nameMatch, counter) => {
    // create
    if (!idMatch && !nameMatch) {
      this.createStyle(layer);
      counter.created++;
    }

    // rename
    else if (idMatch && !nameMatch) {
      this.renameStyle(idMatch, layer);
      counter.renamed++;
    }

    // update
    else if ((!idMatch && nameMatch) || idMatch !== nameMatch) {
      this.updateStyle(nameMatch, layer);
      counter.updated++;
    }

    // ignore
    else {
      counter.ignored++;
    }
  };

  // I could actually check the entire array, but I don't think is necessary
  isPropEmpty = (layer) => isArrayEmpty(layer[this.layerProperties[0]]);

  isPropMixed = (layer) => this.layerProperties.some((prop) => layer[prop] === figma.mixed);
}
