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

  applyStyle = (layer: SceneNode, style: BaseStyle) => {
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

  changeStyleDescription = (styleNameMatch, styleIdMatch) => {
    const currentDescription = styleNameMatch.description || '';

    const keyword = 'Previous style:';
    const pos = currentDescription.lastIndexOf(keyword);
    const newDescription =
      currentDescription.slice(0, pos) + `${keyword}\n${styleIdMatch?.name || ''}`;

    return !styleIdMatch
      ? (styleNameMatch.description = currentDescription)
      : (styleNameMatch.description = newDescription);
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

  getLocalStyleByByExternalId = (layer: SceneNode) => {
    const externalStyleName = this.getStyleById(layer)?.name || '';
    return this.getLocalStyles().find((style) => style.name === externalStyleName);
  };

  getStyleByName = (name, partialMatch = defaultSettings.partialMatch) => {
    const stylesByType = this.getLocalStyles();
    const match = stylesByType.find(
      (style) => style.name === addAffixTo(name, this.prefix, this.suffix),
    );

    if (match) {
      return match;
    }

    if (partialMatch === true) {
      return stylesByType.find((style) =>
        name.split(/\W+/g).find((word) => style.name.includes(word)),
      );
    }
  };

  renameStyle = (layer, style) => {
    if (!style) {
      console.log(`Rename: No style found for ${layer.name}`);
      return;
    }

    style.name = addAffixTo(layer.name, this.prefix, this.suffix);
  };

  updateStyle = (layer, styleNameMatch, addPrevToDescription, styleIdMatch = null) => {
    if (addPrevToDescription) {
      this.changeStyleDescription(styleNameMatch, styleIdMatch);
    }

    this.detachStyle(layer);
    this.styleProps.map((prop, propIndex) => {
      if (!styleNameMatch || this.isPropEmpty(layer)) {
        console.log(
          `Update: ${this.layerProps[propIndex]} not found || No style found for ${layer.name}`,
        );
        return;
      }

      styleNameMatch[prop] = layer[this.layerProps[propIndex]];
    });
    this.applyStyle(layer, styleNameMatch);
  };

  removeStyle = (layer, style) => {
    if (!style || style.remote === true) {
      return;
    }

    const cmdType = CMD.split('-')[1];
    if (cmdType === this.layerPropType.toLocaleLowerCase() || cmdType === 'all') {
      this.detachStyle(layer);
      style.remove();
      counter.removed++;
    }
  };

  generateStyle = (layer, options) => {
    const {
      styleIdMatch,
      styleNameMatch,
      updateUsingLocalStyles = defaultSettings.updateUsingLocalStyles,
      addPrevToDescription = defaultSettings.addPrevToDescription,
    } = options;

    if (this.isPropEmpty(layer) || this.isPropMixed(layer)) {
      console.log(`Generate: We have some mixed or empty props.`);
      return;
    }

    // create
    if ((!styleIdMatch || styleIdMatch?.remote) && !styleNameMatch) {
      this.createStyle(layer, addPrevToDescription);
      counter.created++;
    }

    // update only if external style is applied - kind of old behaviour
    else if (
      (!styleIdMatch || styleIdMatch?.remote) &&
      styleNameMatch &&
      updateUsingLocalStyles === false
    ) {
      this.updateStyle(layer, styleNameMatch, addPrevToDescription, styleIdMatch);
      counter.updated++;
    }

    //
    else if (styleIdMatch !== styleNameMatch && updateUsingLocalStyles === false) {
      this.renameStyle(layer, styleIdMatch);
      counter.renamed++;
    }

    // using localStyles - new behaviour
    else if (
      styleIdMatch &&
      !styleIdMatch?.remote &&
      !styleNameMatch &&
      updateUsingLocalStyles === true
    ) {
      this.renameStyle(layer, styleIdMatch);
      counter.renamed++;
    }
    //
    else if (styleIdMatch !== styleNameMatch && updateUsingLocalStyles === true) {
      this.updateStyle(layer, styleNameMatch, addPrevToDescription, styleIdMatch);
      counter.updated++;
    }

    // ignore
    else {
      counter.ignored++;
    }

    counter.generated++;
  };

  isPropEmpty = (layer) => isArrayEmpty(layer[this.layerProps[0]]);
  isPropMixed = (layer) => this.layerProps.some((prop) => layer[prop] === figma.mixed);

  checkAffix = (style: BaseStyle) => {
    return style.name.startsWith(this.prefix) && style.name.endsWith(this.suffix);
  };

  replacePrefix = (name: string, newPrefix = '') => {
    return name.startsWith(this.prefix) ? newPrefix + name.slice(this.prefix.length) : name;
  };

  replaceSuffix = (name: string, newSuffix = '') => {
    return name.endsWith(this.suffix)
      ? name.slice(0, name.lastIndexOf(this.suffix)) + newSuffix
      : name;
  };

  replaceAffix = (name, newPrefix = '', newSuffix = newPrefix) => {
    name = this.replacePrefix(name, newPrefix);
    name = this.replaceSuffix(name, newSuffix);

    return name;
  };
}
