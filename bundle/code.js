(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const CMD = figma.command;
    const counter = {
        applied: 0,
        created: 0,
        customize: 0,
        detached: 0,
        extracted: 0,
        generated: 0,
        textContainer: 0,
        miscContainer: 0,
        ignored: 0,
        renamed: 0,
        removed: 0,
        updated: 0,
    };
    const white = [255, 255, 255, 1];
    const black = [0, 0, 0, 1];
    const transparent = [0, 0, 0, 0];
    const colors = { white, black, transparent };

    const ucFirst = (word) => word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
    const addAffixTo = (word, prefix = '', suffix = '') => prefix + word + suffix;
    const isArrayEmpty = (array) => (array || []).length === 0;
    const groupBy = (array, key) => {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    };
    function clone(val) {
        const type = typeof val;
        if (type === 'undefined' ||
            type === 'number' ||
            type === 'string' ||
            type === 'boolean' ||
            type === 'symbol' ||
            val === null) {
            return val;
        }
        else if (type === 'object') {
            if (val instanceof Array) {
                return val.map(clone);
            }
            else if (val instanceof Uint8Array) {
                return new Uint8Array(val);
            }
            else {
                const o = {};
                for (const key in val) {
                    o[key] = clone(val[key]);
                }
                return o;
            }
        }
        throw 'unknown';
    }
    const checkStyleType = (style, config) => {
        let styleType = style.type;
        if (style.type === 'PAINT') {
            styleType = 'FILL';
            const { filler, strokeer } = config;
            [filler, strokeer].map((styler) => {
                if ((styler.prefix !== '' || styler.suffix !== '') && styler.checkAffix(style)) {
                    styleType = styler.layerPropType;
                }
            });
        }
        return styleType;
    };
    const getFlat = ({ id, children = [] }) => {
        return children.reduce((r, o) => [...r, ...getFlat(o)], [id]);
    };

    class Styler {
        constructor(options = {}) {
            this.applyStyle = (layer, style) => {
                if (!style || layer[this.layerStyleID] === undefined || layer[this.layerStyleID] === style.id) {
                    console.log(`Apply: ${this.layerStyleID} not found || No style found for ${layer.name}`);
                    return;
                }
                layer[this.layerStyleID] = style.id;
                counter.applied++;
            };
            this.createStyle = (layer, addPrevToDescription) => {
                let newStyle = figma[this.createStyleCommand]();
                this.renameStyle(layer, newStyle);
                this.updateStyle(layer, newStyle, addPrevToDescription);
                return newStyle;
            };
            this.changeStyleDescription = (styleNameMatch, styleIdMatch) => {
                const currentDescription = styleNameMatch.description || '';
                const keyword = 'Previous style:';
                const pos = currentDescription.lastIndexOf(keyword);
                const newDescription = currentDescription.slice(0, pos) + `${keyword}\n${(styleIdMatch === null || styleIdMatch === void 0 ? void 0 : styleIdMatch.name) || ''}`;
                return !styleIdMatch
                    ? (styleNameMatch.description = currentDescription)
                    : (styleNameMatch.description = newDescription);
            };
            this.detachStyle = (layer) => {
                if (!layer[this.layerStyleID]) {
                    console.log(`Detach: ${this.layerPropType} not found.`);
                    return;
                }
                layer[this.layerStyleID] = '';
                counter.detached++;
            };
            this.getLocalStyles = () => figma[this.getLocalStylesCommand]();
            this.getStyleById = (layer) => figma.getStyleById(layer[this.layerStyleID]);
            this.getLocalStyleByByExternalId = (layer) => {
                var _a;
                const externalStyleName = ((_a = this.getStyleById(layer)) === null || _a === void 0 ? void 0 : _a.name) || '';
                return this.getLocalStyles().find((style) => style.name === externalStyleName);
            };
            this.getStyleByName = (name, partialMatch) => {
                const stylesByType = this.getLocalStyles();
                const match = stylesByType.find((style) => style.name === addAffixTo(name, this.prefix, this.suffix));
                if (match) {
                    return match;
                }
                if (partialMatch === true) {
                    return stylesByType.find((style) => name.split(/\W+/g).find((word) => style.name.includes(word)));
                }
            };
            this.renameStyle = (layer, style) => {
                if (!style) {
                    console.log(`Rename: No style found for ${layer.name}`);
                    return;
                }
                style.name = addAffixTo(layer.name, this.prefix, this.suffix);
            };
            this.updateStyle = (layer, styleNameMatch, addPrevToDescription, styleIdMatch = null) => {
                if (addPrevToDescription) {
                    this.changeStyleDescription(styleNameMatch, styleIdMatch);
                }
                this.detachStyle(layer);
                this.styleProps.map((prop, propIndex) => {
                    if (!styleNameMatch || this.isPropEmpty(layer)) {
                        console.log(`Update: ${this.layerProps[propIndex]} not found || No style found for ${layer.name}`);
                        return;
                    }
                    styleNameMatch[prop] = layer[this.layerProps[propIndex]];
                });
                this.applyStyle(layer, styleNameMatch);
            };
            this.removeStyle = (layer, style) => {
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
            this.generateStyle = (layer, options) => {
                const { styleIdMatch, styleNameMatch, updateUsingLocalStyles, addPrevToDescription } = options;
                if (this.isPropEmpty(layer) || this.isPropMixed(layer)) {
                    console.log(`Generate: We have some mixed or empty props.`);
                    return;
                }
                if ((!styleIdMatch || (styleIdMatch === null || styleIdMatch === void 0 ? void 0 : styleIdMatch.remote)) && !styleNameMatch) {
                    this.createStyle(layer, addPrevToDescription);
                    counter.created++;
                }
                else if ((!styleIdMatch || (styleIdMatch === null || styleIdMatch === void 0 ? void 0 : styleIdMatch.remote)) &&
                    styleNameMatch &&
                    updateUsingLocalStyles === false) {
                    this.updateStyle(layer, styleNameMatch, addPrevToDescription, styleIdMatch);
                    counter.updated++;
                }
                else if (styleIdMatch !== styleNameMatch && updateUsingLocalStyles === false) {
                    this.renameStyle(layer, styleIdMatch);
                    counter.renamed++;
                }
                else if (styleIdMatch &&
                    !(styleIdMatch === null || styleIdMatch === void 0 ? void 0 : styleIdMatch.remote) &&
                    !styleNameMatch &&
                    updateUsingLocalStyles === true) {
                    this.renameStyle(layer, styleIdMatch);
                    counter.renamed++;
                }
                else if (styleIdMatch !== styleNameMatch && updateUsingLocalStyles === true) {
                    this.updateStyle(layer, styleNameMatch, addPrevToDescription, styleIdMatch);
                    counter.updated++;
                }
                else {
                    counter.ignored++;
                }
                counter.generated++;
            };
            this.isPropEmpty = (layer) => isArrayEmpty(layer[this.layerProps[0]]);
            this.isPropMixed = (layer) => this.layerProps.some((prop) => layer[prop] === figma.mixed);
            this.checkAffix = (style) => {
                return style.name.startsWith(this.prefix) && style.name.endsWith(this.suffix);
            };
            this.replacePrefix = (name, newPrefix = '') => {
                return name.startsWith(this.prefix) ? newPrefix + name.slice(this.prefix.length) : name;
            };
            this.replaceSuffix = (name, newSuffix = '') => {
                return name.endsWith(this.suffix)
                    ? name.slice(0, name.lastIndexOf(this.suffix)) + newSuffix
                    : name;
            };
            this.replaceAffix = (name, newPrefix = '', newSuffix = newPrefix) => {
                name = this.replacePrefix(name, newPrefix);
                name = this.replaceSuffix(name, newSuffix);
                return name;
            };
            const { name = 'styler', styleType = '', layerPropType = styleType, prefix = '', suffix = '', styleProps, layerProps, } = options;
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
    }

    class Config {
        constructor(options) {
            const { addPrevToDescription, framesPerSection, textsPerSection, notificationTimeout, updateUsingLocalStyles, partialMatch, texterPrefix, texterSuffix, griderPrefix, griderSuffix, fillerPrefix, fillerSuffix, strokeerPrefix, strokeerSuffix, effecterPrefix, effecterSuffix, } = options;
            this.addPrevToDescription = addPrevToDescription;
            this.framesPerSection = framesPerSection;
            this.textsPerSection = textsPerSection;
            this.notificationTimeout = notificationTimeout;
            this.updateUsingLocalStyles = updateUsingLocalStyles;
            this.partialMatch = partialMatch;
            this.texter = new Styler({
                name: 'texter',
                styleType: 'text',
                styleProps: [
                    'fontName',
                    'fontSize',
                    'letterSpacing',
                    'lineHeight',
                    'paragraphIndent',
                    'paragraphSpacing',
                    'textCase',
                    'textDecoration',
                ],
                prefix: texterPrefix,
                suffix: texterSuffix,
            });
            this.grider = new Styler({
                name: 'grider',
                styleType: 'grid',
                styleProps: ['layoutGrids'],
                prefix: griderPrefix,
                suffix: griderSuffix,
            });
            this.filler = new Styler({
                name: 'filler',
                styleType: 'paint',
                styleProps: ['paints'],
                layerProps: ['fills'],
                layerPropType: 'fill',
                prefix: fillerPrefix,
                suffix: fillerSuffix,
            });
            this.strokeer = new Styler({
                name: 'strokeer',
                styleType: 'paint',
                styleProps: ['paints'],
                layerProps: ['strokes'],
                layerPropType: 'stroke',
                prefix: strokeerPrefix,
                suffix: strokeerSuffix,
            });
            this.effecter = new Styler({
                name: 'effecter',
                styleType: 'effect',
                styleProps: ['effects'],
                prefix: effecterPrefix,
                suffix: effecterSuffix,
            });
            this.allStylers = [this.texter, this.filler, this.strokeer, this.effecter, this.grider];
            this.stylersWithoutTexter = [this.filler, this.strokeer, this.effecter, this.grider];
            this.texterOnly = [this.texter];
        }
    }

    const messages = (counter) => {
        return {
            applied: {
                empty: `🤔 No local style found to apply. Maybe? Renam...`,
                single: `✌️ Applied only ${counter.applied} style. He he...`,
                multiple: `✌️ Applied ${counter.applied} styles. He he...`,
            },
            detached: {
                empty: `🤔 No style was applied on any of the selected layers. Idk...`,
                single: `💔 Detached only ${counter.detached} style. Layers will miss you...`,
                multiple: `💔 Detached ${counter.detached} styles. Layers will miss you...`,
            },
            extracted: {
                empty: `😵 No local style found to extract. Ouch...`,
                single: `😺 Created only ${counter.extracted} layer. Uhuu...`,
                multiple: `😺 Created ${counter.extracted} layers. Uhuu...`,
            },
            generated: {
                empty: `😭 We do not support empty or mixed properties. Oh, Noo...`,
                single: `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      👻 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
                multiple: `
      🔨 Created: ${counter.created} -
      ✨ Updated: ${counter.updated} -
      👻 Renamed: ${counter.renamed} -
      😶 No changes: ${counter.ignored}
    `,
            },
            removed: {
                empty: `🤔 No local style was applied on any of the selected layers. Yep, it's not weird...`,
                single: `🔥 Removed only ${counter.removed} style. Rrr...`,
                multiple: `🔥 Removed ${counter.removed} styles. Rrr...`,
            },
            customize: {
                empty: '🌟 Settings were saved, but there was nothing to update.',
                single: '✅ Settings were saved and only 1 style was updated.',
                multiple: `✅ Settings were saved and ${counter.customize} style was updated.`,
            },
            layers: {
                empty: '😎 You must select at least 1 layer. Yea...',
            },
            cancelSettings: {
                empty: '🥺 Nothing was changed, everything is as before.',
            },
            clearCache: {
                empty: '🧹 Cleaned saved settings from cache.',
            },
        };
    };

    const showNofication = (counter = 0, messages, timeout = 7000) => {
        const { verySpecial = '', special = '', empty = '', single = '', multiple = '' } = messages;
        switch (counter) {
            case -2:
                figma.notify(verySpecial, { timeout });
                break;
            case -1:
                figma.notify(special, { timeout });
                break;
            case 0:
                figma.notify(empty, { timeout });
                break;
            case 1:
                figma.notify(single, { timeout });
                break;
            default:
                figma.notify(multiple, { timeout });
        }
        figma.closePlugin();
    };
    const showNotificationAtArrayEnd = (type, notificationOptions = {}) => {
        const { layerIndex = 0, layersLength = 1, stylerIndex = 0, stylersLength = 1, notificationTimeout, } = notificationOptions;
        if (layerIndex === layersLength - 1 && stylerIndex === stylersLength - 1) {
            showNofication(counter[type], messages(counter)[type], notificationTimeout);
        }
    };

    const namesRGB = ['r', 'g', 'b'];
    function webRGBToFigmaRGB(color) {
        const rgb = {};
        namesRGB.forEach((e, i) => {
            rgb[e] = color[i] / 255;
        });
        if (color[3] !== undefined)
            rgb['a'] = color[3];
        return rgb;
    }

    const isContainer = (layer) => ['FRAME', 'COMPONENT', 'INSTANCE'].includes(layer.type);
    const isShape = (layer) => ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR'].includes(layer.type);
    const isText = (layer) => layer.type === 'TEXT';
    const excludeGroups = (layers) => layers.filter((layer) => isContainer(layer) || isShape(layer) || isText(layer));
    const changeColor = (layer, prop, rgba = [0, 0, 0, 1]) => {
        const color = webRGBToFigmaRGB(rgba);
        const { r, g, b, a } = color;
        const cloned = clone(layer[prop]);
        cloned[0].color = { r, g, b };
        cloned[0].opacity = a;
        return (layer[prop] = cloned);
    };
    const changeLayoutProps = (targetedFrame, options = {}) => {
        const { layoutMode = 'NONE', layoutAlign = 'MIN', counterAxisSizingMode = 'AUTO', horizontalPadding = 0, verticalPadding = 0, itemSpacing = 0, } = options;
        if (!targetedFrame) {
            return;
        }
        targetedFrame.layoutMode = layoutMode;
        targetedFrame.layoutAlign = layoutAlign;
        targetedFrame.counterAxisSizingMode = counterAxisSizingMode;
        targetedFrame.horizontalPadding = horizontalPadding;
        targetedFrame.verticalPadding = verticalPadding;
        targetedFrame.itemSpacing = itemSpacing;
        return targetedFrame;
    };
    const createTextLayer = (name = 'TextLayer', parent = figma.currentPage, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
        const { color = colors.transparent, xPos = 0, yPos = xPos } = options;
        const newLayer = figma.createText();
        yield figma.loadFontAsync(newLayer.fontName);
        newLayer.name = name;
        newLayer.characters = name;
        if (color) {
            changeColor(newLayer, 'fills', color);
        }
        newLayer.x = xPos;
        newLayer.y = yPos;
        parent.appendChild(newLayer);
        return newLayer;
    });
    const createFrameLayer = (name = 'FrameLayer', parent = figma.currentPage, options = {}) => {
        const { color = colors.transparent, layoutProps = {}, size = 80, width = size, height = width, xPos = 0, yPos = xPos, cornerRadius = 12, } = options;
        const newLayer = figma.createFrame();
        newLayer.name = name;
        if (color) {
            changeColor(newLayer, 'fills', color);
        }
        newLayer.x = xPos;
        newLayer.y = yPos;
        newLayer.resize(width, height);
        newLayer.cornerRadius = cornerRadius;
        parent.appendChild(newLayer);
        changeLayoutProps(newLayer, layoutProps);
        return newLayer;
    };
    const createLayer = (name = 'Layer', parent = figma.currentPage, layerType = 'PAINT', options = {}) => __awaiter(void 0, void 0, void 0, function* () {
        const createCommand = {
            TEXT: createTextLayer,
            GRID: createFrameLayer,
            PAINT: createFrameLayer,
            EFFECT: createFrameLayer,
        };
        return yield createCommand[layerType](name, parent, options);
    });
    const ungroup = (layer) => layer.parent.parent.appendChild(layer);
    const cleanSelection = () => {
        const selection = excludeGroups(figma.currentPage.selection);
        const selectionByParent = Object.values(groupBy(selection, 'parent'));
        const layers = [];
        selectionByParent.map((group) => {
            const orderedGroup = [...group].sort((current, next) => {
                return current.parent.children.indexOf(current) - next.parent.children.indexOf(next);
            });
            layers.push(orderedGroup);
        });
        return layers.flat().reverse();
    };

    const getAllLocalStyles = () => {
        return [
            ...figma.getLocalTextStyles(),
            ...figma.getLocalGridStyles(),
            ...figma.getLocalPaintStyles(),
            ...figma.getLocalEffectStyles(),
        ];
    };
    const updateStyleNames = (currentConfig, newConfig) => {
        const { allStylers } = currentConfig;
        allStylers.map((styler) => {
            const styles = styler.getLocalStyles();
            if (isArrayEmpty(styles)) {
                return;
            }
            styles.map((style) => {
                if (style.type !== styler.styleType ||
                    checkStyleType(style, currentConfig) !== styler.layerPropType) {
                    return;
                }
                const { name } = styler;
                const newPrefix = newConfig[name].prefix;
                const newSuffix = newConfig[name].suffix;
                if (newPrefix === styler.prefix && newSuffix === styler.suffix) {
                    return;
                }
                style.name = styler.replaceAffix(style.name, newPrefix, newSuffix);
                counter.customize++;
            });
        });
    };
    const changeAllStyles = (config) => {
        const { addPrevToDescription, allStylers, notificationTimeout, texterOnly, partialMatch, updateUsingLocalStyles, } = config;
        const layers = cleanSelection();
        if (isArrayEmpty(layers)) {
            showNofication(0, messages(counter).layers, notificationTimeout);
            return;
        }
        const layersLength = layers.length;
        layers.map((layer, layerIndex) => __awaiter(void 0, void 0, void 0, function* () {
            let stylers = allStylers;
            const oldLayerName = layer.name;
            if (layer.type === 'TEXT') {
                yield figma.loadFontAsync(layer.fontName);
                if (layer.name[0] !== '+') {
                    stylers = texterOnly;
                }
                else {
                    layer.name = layer.name.slice(1);
                }
            }
            const stylersLength = stylers.length;
            stylers.map((styler, stylerIndex) => {
                const notificationOptions = {
                    layerIndex,
                    layersLength,
                    stylerIndex,
                    stylersLength,
                    notificationTimeout,
                };
                const styleIdMatch = styler.getStyleById(layer);
                const styleNameMatch = styler.getStyleByName(layer.name, partialMatch);
                if (CMD === 'generate-all-styles') {
                    styler.generateStyle(layer, {
                        styleNameMatch,
                        styleIdMatch,
                        updateUsingLocalStyles,
                        addPrevToDescription,
                    });
                    showNotificationAtArrayEnd('generated', notificationOptions);
                }
                else if (CMD === 'detach-all-styles') {
                    styler.detachStyle(layer);
                    showNotificationAtArrayEnd('detached', notificationOptions);
                }
                else if (CMD.includes('remove')) {
                    styler.removeStyle(layer, styleIdMatch);
                    showNotificationAtArrayEnd('removed', notificationOptions);
                }
                else {
                    figma.closePlugin('🤷‍♂️ This should not happen. Nothing was changed...');
                }
            });
            layer.name = oldLayerName;
        }));
    };
    const extractAllStyles = (config) => __awaiter(void 0, void 0, void 0, function* () {
        const { allStylers, framesPerSection, textsPerSection } = config;
        if (isArrayEmpty(getAllLocalStyles())) {
            return;
        }
        const horizFlow = {
            layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 32 },
        };
        const vertFlow = {
            layoutProps: { layoutMode: 'VERTICAL', itemSpacing: 32 },
        };
        const mainContainer = createFrameLayer('main', undefined, {
            layoutProps: { layoutMode: 'HORIZONTAL', itemSpacing: 128 },
        });
        const textContainer = createFrameLayer('text', mainContainer, horizFlow);
        const miscContainer = createFrameLayer('misc', mainContainer, vertFlow);
        let createdLayers = [];
        let newSection;
        for (const styler of allStylers) {
            const styles = styler.getLocalStyles();
            if (isArrayEmpty(styles)) {
                continue;
            }
            const parentByType = styler.styleType === 'TEXT' ? textContainer : miscContainer;
            const flowByType = styler.styleType === 'TEXT' ? vertFlow : horizFlow;
            const itemsPerSection = styler.styleType === 'TEXT' ? textsPerSection : framesPerSection;
            const optionByType = styler.styleType === 'TEXT' ? { color: colors.black } : { size: 80, color: colors.white };
            yield Promise.all(styles.map((style, styleIndex) => __awaiter(void 0, void 0, void 0, function* () {
                if (style.type !== styler.styleType ||
                    checkStyleType(style, config) !== styler.layerPropType) {
                    return;
                }
                const curatedStyleName = styler.replaceAffix(style.name, '');
                let layerMatch = createdLayers.find((layer) => layer.name === curatedStyleName);
                if (!layerMatch) {
                    if (styleIndex % itemsPerSection === 0) {
                        newSection = createFrameLayer('section', parentByType, flowByType);
                    }
                    layerMatch = yield createLayer(curatedStyleName, newSection, style.type, optionByType);
                    createdLayers.push(layerMatch);
                    counter.extracted++;
                }
                styler.applyStyle(layerMatch, style);
            })));
        }
        yield new Promise((res) => setTimeout(res, 100));
        figma.group(createdLayers, figma.currentPage);
        createdLayers.map((layer) => ungroup(layer));
        figma.viewport.scrollAndZoomIntoView(createdLayers);
        mainContainer.remove();
    });
    const applyStyles = (config) => {
        const { addPrevToDescription, allStylers, notificationTimeout, texterOnly, partialMatch, updateUsingLocalStyles, } = config;
        const selectionIds = figma.currentPage.selection.map((layer) => getFlat(layer)).flat();
        const selection = selectionIds.map((id) => figma.getNodeById(id));
        if (isArrayEmpty(selection)) {
            showNofication(0, messages(counter).layers, notificationTimeout);
            return;
        }
        const selectionLength = selection.length;
        selection.map((layer, layerIndex) => __awaiter(void 0, void 0, void 0, function* () {
            let stylers = allStylers;
            const oldLayerName = layer.name;
            if (layer.type === 'TEXT') {
                yield figma.loadFontAsync(layer.fontName);
                if (layer.name[0] !== '+') {
                    stylers = texterOnly;
                }
                else {
                    layer.name = layer.name.slice(1);
                }
            }
            const stylersLength = stylers.length;
            stylers.map((styler, stylerIndex) => {
                const notificationOptions = {
                    layerIndex,
                    selectionLength,
                    stylerIndex,
                    stylersLength,
                    notificationTimeout,
                };
                const styleNameMatch = styler.getStyleByName(layer.name, partialMatch);
                const applyingStyle = styler.getLocalStyleByByExternalId(layer) || styleNameMatch;
                styler.applyStyle(layer, applyingStyle);
                showNotificationAtArrayEnd('applied', notificationOptions);
            });
            layer.name = oldLayerName;
        }));
    };

    const DEFAULT_SETTINGS = {
        addPrevToDescription: true,
        framesPerSection: 6,
        textsPerSection: 8,
        notificationTimeout: 6000,
        updateUsingLocalStyles: false,
        partialMatch: false,
        fillerPrefix: '',
        fillerSuffix: '',
        strokeerPrefix: '',
        strokeerSuffix: '-stroke',
        effecterPrefix: '',
        effecterSuffix: '',
        griderPrefix: '',
        griderSuffix: '',
        texterPrefix: '',
        texterSuffix: '',
    };
    const DEFAULT_SETTINGS_KEY = 'cachedSettings';
    function loadSettingsAsync(defaultSettings, settingsKey = DEFAULT_SETTINGS_KEY) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = (yield figma.clientStorage.getAsync(settingsKey)) || defaultSettings;
            return Object.assign(defaultSettings, settings);
        });
    }
    function saveSettingsAsync(settings, settingsKey = DEFAULT_SETTINGS_KEY) {
        return __awaiter(this, void 0, void 0, function* () {
            yield figma.clientStorage.setAsync(settingsKey, settings);
        });
    }

    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedSettings = yield loadSettingsAsync(DEFAULT_SETTINGS);
            let currentConfig = new Config(cachedSettings);
            const { notificationTimeout } = currentConfig;
            switch (CMD) {
                case 'clear-cache':
                    yield saveSettingsAsync(undefined);
                    showNofication(0, messages(counter).clearCache, currentConfig.notificationTimeout);
                    break;
                case 'extract-all-styles':
                    extractAllStyles(currentConfig).then(() => showNofication(counter.extracted, messages(counter).extracted, notificationTimeout));
                    break;
                case 'customize-plugin':
                    figma.showUI(__html__, { width: 320, height: 424 });
                    figma.ui.postMessage(cachedSettings);
                    figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
                        if (msg.type === 'cancel-modal') {
                            showNofication(0, messages(counter).cancelSettings, notificationTimeout);
                        }
                        else if (msg.type === 'save-settings') {
                            const newConfig = new Config(msg.uiSettings);
                            updateStyleNames(currentConfig, newConfig);
                            showNofication(counter.customize, messages(counter).customize, newConfig.notificationTimeout);
                            yield saveSettingsAsync(msg.uiSettings);
                        }
                    });
                    break;
                case 'apply-all-styles':
                    applyStyles(currentConfig);
                    break;
                default:
                    changeAllStyles(currentConfig);
                    break;
            }
        });
    }
    main();

}());
