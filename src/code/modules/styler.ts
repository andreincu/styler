import { defaultSettings } from './default-settings.js';
import { CMD, counter } from './globals';
import { addAffixTo, isArrayEmpty, ucFirst } from './utils';

interface StylerOptions {
  name?: string;
  styleType?: string;
  styleProps?: string[];
  layerProps?: string[];
  layerPropType?: string;
  prefix?: string;
  suffix?: string;
}

export class Styler {
  name: string;
  styleType: string;
  styleProps: string[];
  layerProps: string[];
  layerPropType: string;
  layerStyleID: string;
  prefix: string;
  suffix: string;

  constructor(options: StylerOptions = {}) {
    const {
      name = 'styler',
      styleType = '',
      layerPropType = styleType,
      prefix = '',
      suffix = '',
      styleProps,
      layerProps,
    } = options;

    this.name = name;
    this.styleType = styleType.toLocaleUpperCase();
    this.styleProps = styleProps || layerProps;
    this.layerProps = layerProps || styleProps;
    this.layerPropType = layerPropType.toLocaleUpperCase();
    this.layerStyleID = addAffixTo(layerPropType.toLocaleLowerCase(), '', 'StyleId');
    this.prefix = prefix;
    this.suffix = suffix;
  }

  applyStyle = (layer: SceneNode, style: BaseStyle, { oldLayerName = layer.name } = {}) => {
    if (oldLayerName !== layer.name && ![layer[this.layerProps[0]]].flat().length) {
      return;
    }

    if (!style || layer[this.layerStyleID] === undefined || layer[this.layerStyleID] === style.id) {
      console.log(`Apply: ${this.layerStyleID} not found || No style found for ${layer.name}`);
      return;
    }

    layer[this.layerStyleID] = style.id;
    counter.applied++;
  };

  createStyle = (layer: SceneNode) => {
    const newStyle = figma[addAffixTo(ucFirst(this.styleType), 'create', 'Style')]();

    this.renameStyle(layer, newStyle);
    this.updateStyle(layer, newStyle);

    return newStyle;
  };

  detachStyle = (layer) => {
    if (!layer[this.layerStyleID]) {
      console.log(`Detach: ${this.layerPropType} not found.`);
      return;
    }

    layer[this.layerStyleID] = '';
    counter.detached++;
  };

  getLocalStyles = () => {
    const getCommand = addAffixTo(ucFirst(this.styleType), 'getLocal', 'Styles');
    return figma[getCommand]();
  };

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleID]);

  getStyleByName = (name, { exactMatch = true } = {}) => {
    const stylesByType = this.getLocalStyles();
    const match = stylesByType.find((style) => style.name === addAffixTo(name, this.prefix, this.suffix));

    if (exactMatch === true) {
      return match;
    } else {
      if (match) {
        return match;
      } else {
        return stylesByType.find((style) => name.split(/\W+/g).find((word: string) => style.name.includes(word)));
      }
    }
  };

  changeStyleDescription = (layer: SceneNode, style: BaseStyle) => {
    const idMatch = this.getStyleById(layer);

    return !idMatch ? style.description : (style.description = `Previous style:\n${idMatch.name}`);
  };

  renameStyle = (layer: SceneNode, style: BaseStyle) => {
    if (!style) {
      console.log(`Rename: No style found for ${layer.name}`);
      return;
    }

    style.name = addAffixTo(layer.name, this.prefix, this.suffix);
  };

  updateStyle = (layer: SceneNode, style: BaseStyle, options = defaultSettings) => {
    const { addPreviousStyleToDescription } = options;

    if (addPreviousStyleToDescription) {
      this.changeStyleDescription(layer, style);
    }

    this.detachStyle(layer);
    this.styleProps.map((prop, index) => {
      if (!style || layer[this.layerProps[index]] === undefined) {
        console.log(`Update: ${this.layerProps[index]} not found || No style found for ${layer.name}`);
        return;
      }

      style[prop] = layer[this.layerProps[index]];
    });
    this.applyStyle(layer, style);
  };

  removeStyle = (style: BaseStyle) => {
    if (!style || style.remote === true) {
      return;
    }

    const cmdType = CMD.split('-')[1];
    if (cmdType === this.layerPropType.toLocaleLowerCase() || cmdType === 'all') {
      style.remove();
      counter.removed++;
    }
  };

  generateStyle = (layer: SceneNode, matches: any = {}, options = defaultSettings) => {
    const { nameMatch, idMatch } = matches;
    const { updateUsingLocalStyles } = options;

    if (this.isPropMixed(layer) || this.isPropEmpty(layer)) {
      console.log(`Generate: We have some mixed or empty props.`);
      return;
    }

    // create
    if ((!idMatch || idMatch.remote) && !nameMatch) {
      this.createStyle(layer);
      counter.created++;
    }
    // updateUsingLocalStyles - enabled
    // rename
    else if (idMatch && !idMatch.remote && !nameMatch && updateUsingLocalStyles === true) {
      this.renameStyle(layer, idMatch);
      counter.renamed++;
    }
    // update
    else if (idMatch !== nameMatch && updateUsingLocalStyles === true) {
      this.updateStyle(layer, nameMatch);
      counter.updated++;
    }

    // updateUsingLocalStyles - disabled
    // update
    else if ((!idMatch || idMatch.remote) && nameMatch && updateUsingLocalStyles === false) {
      this.updateStyle(layer, nameMatch);
      counter.updated++;
    }
    // rename
    else if (idMatch !== nameMatch && updateUsingLocalStyles === false) {
      this.renameStyle(layer, idMatch);
      counter.renamed++;
    }

    // ignore
    else {
      counter.ignored++;
    }

    counter.generated++;
  };

  isPropEmpty = (layer: SceneNode) => isArrayEmpty(layer[this.layerProps[0]]);
  isPropMixed = (layer: SceneNode) => this.layerProps.some((prop) => layer[prop] === figma.mixed);
}
