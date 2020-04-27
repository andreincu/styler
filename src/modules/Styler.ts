import { addAffixTo, ucFirst } from './string-utils';

const toStyleId = (prop) => (prop === undefined ? undefined : addAffixTo(prop.toLocaleLowerCase(), '', 'StyleId'));

export default class Styler {
  styleType: string;
  styleProperties: Array<string>;
  layerProperties: Array<string>;
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
    this.layerStyleId = toStyleId(options.layerPropertyType) || toStyleId(options.styleType);
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';
  }

  applyStyle = (layer, style) => (layer[this.layerStyleId] = style.id);

  createStyle = async (layer) => {
    const createStyle = addAffixTo(ucFirst(this.styleType), 'create', 'Style');

    let newStyle = figma[createStyle]();
    this.renameStyle(layer, newStyle);
    await this.updateStyle(layer, newStyle);

    return newStyle;
  };

  detachStyle = (layer) => (layer[this.layerStyleId] = '');

  getStyleById = (layer, styles) => styles.find((style) => style.id === layer[this.layerStyleId]);

  getStyleByName = (layer, styles) => styles.find((style) => style.name === addAffixTo(layer.name));

  renameStyle = (layer, style) => (style.name = addAffixTo(layer.name, '', ''));

  updateStyle = async (layer, style) => {
    if (this.styleType === 'TEXT') {
      await figma.loadFontAsync(layer.fontName);
    }

    this.detachStyle(layer);
    this.layerProperties.map((prop, index) => (style[this.styleProperties[index]] = layer[prop]));
    this.applyStyle(layer, style);

    return style;
  };
}
