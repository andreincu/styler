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
  createStyleCommand: string;
  getLocalStylesCommand: string;

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
    this.createStyleCommand = addAffixTo(ucFirst(styleType), 'create', 'Style');
    this.getLocalStylesCommand = addAffixTo(ucFirst(styleType), 'getLocal', 'Styles');
  }

  applyStyle = (layer, style, oldLayerName = layer.name) => {
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

  createStyle = (layer, addPrevToDescription) => {
    let newStyle = figma[this.createStyleCommand]();

    this.renameStyle(layer, newStyle);
    this.updateStyle(layer, newStyle, addPrevToDescription);

    return newStyle;
  };

  changeStyleDescription = (layer, style) => {
    const idMatch = this.getStyleById(layer);
    const currentDescription = style.description;

    const keyword = 'Previous style:';
    const pos = currentDescription.lastIndexOf(keyword);
    const newDescription = currentDescription.slice(0, pos) + '\n' + `${keyword}\n ${idMatch.name}`;

    return !idMatch ? currentDescription : newDescription;
  };

  detachStyle = (layer) => {
    if (!layer[this.layerStyleID]) {
      console.log(`Detach: ${this.layerPropType} not found.`);
      return;
    }

    layer[this.layerStyleID] = '';
    counter.detached++;
  };

  getLocalStyles = () => figma[this.getLocalStylesCommand]();

  getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleID]);

  getStyleByName = (name, partialMatch = defaultSettings.partialMatch) => {
    const stylesByType = this.getLocalStyles();
    const match = stylesByType.find((style) => style.name === addAffixTo(name, this.prefix, this.suffix));

    if (match) {
      return match;
    }

    if (partialMatch === true) {
      return stylesByType.find((style) => name.split(/\W+/g).find((word) => style.name.includes(word)));
    }
  };

  renameStyle = (layer, style) => {
    if (!style) {
      console.log(`Rename: No style found for ${layer.name}`);
      return;
    }

    style.name = addAffixTo(layer.name, this.prefix, this.suffix);
  };

  updateStyle = (layer, style, addPrevToDescription) => {
    if (addPrevToDescription) {
      this.changeStyleDescription(layer, style);
    }

    this.detachStyle(layer);
    this.styleProps.map((prop, propIndex) => {
      if (!style || layer[this.layerProps[propIndex]] === undefined) {
        console.log(`Update: ${this.layerProps[propIndex]} not found || No style found for ${layer.name}`);
        return;
      }

      style[prop] = layer[this.layerProps[propIndex]];
    });
    this.applyStyle(layer, style);
  };

  removeStyle = (style) => {
    if (!style || style.remote === true) {
      return;
    }

    const cmdType = CMD.split('-')[1];
    if (cmdType === this.layerPropType.toLocaleLowerCase() || cmdType === 'all') {
      style.remove();
      counter.removed++;
    }
  };

  generateStyle = (layer, options) => {
    const {
      idMatch,
      nameMatch,
      updateUsingLocalStyles = defaultSettings.updateUsingLocalStyles,
      addPrevToDescription = defaultSettings.addPrevToDescription,
    } = options;

    if (this.isPropEmpty(layer) || this.isPropMixed(layer)) {
      console.log(`Generate: We have some mixed or empty props.`);
      return;
    }

    // create
    if ((!idMatch || idMatch.remote) && !nameMatch) {
      this.createStyle(layer, addPrevToDescription);
      counter.created++;
    }

    // update only if external style is applied - kind of old behaviour
    else if (updateUsingLocalStyles === false) {
      if ((!idMatch || idMatch.remote) && nameMatch) {
        this.updateStyle(layer, nameMatch, addPrevToDescription);
        counter.updated++;
      } else if (idMatch !== nameMatch) {
        this.renameStyle(layer, idMatch);
        counter.renamed++;
      }
    }

    // using localStyles - new behaviour
    else if (updateUsingLocalStyles === true) {
      if (idMatch && !idMatch.remote && !nameMatch) {
        this.renameStyle(layer, idMatch);
        counter.renamed++;
      } else if (idMatch !== nameMatch) {
        this.updateStyle(layer, nameMatch, addPrevToDescription);
        counter.updated++;
      }
    }

    // ignore
    else {
      counter.ignored++;
    }

    counter.generated++;
  };

  isPropEmpty = (layer) => isArrayEmpty(layer[this.layerProps[0]]);
  isPropMixed = (layer) => this.layerProps.some((prop) => layer[prop] === figma.mixed);
}
