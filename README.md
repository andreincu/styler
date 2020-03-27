# Styler

## Description

Styler is a plugin for figma that is inspired by [Sketch Style Generator plugin](https://github.com/lucaorio/sketch-styles-generator) made by **Luca Orio**.  
The plugin generates styles that inherit the properties from the selected layers.

The goal of the plugin is to quickly create styles that represent the foundation of a design system and to help to maintain it.

## Features

- Create, rename or update styles based on selected layers;
- Apply styles to selection based of layer name (layerName = styleName);
- Detach styles from the selected layers;
- Remove styles by type (grid, text, fill, stroke or effect) based of selected layers
- Clear all styles (basically deleting all the styles from the document);

## Usage

1. Select any number of layers
1. Don't bother with the names of the layers, you can rename it later
   > I recommend using bulk rename `Cmd + R` (Mac) or `Ctrl + R` (Windows)
1. Use **Generate Styles** to:
   - **Create** new styles, if there is no style attached and no layer name match
   - **Rename** style, if any style is attached to the layer (applied)
   - **Update** style, if layer name is the same as the style name
     > In order to update a style, you must detach the previous one first, otherwise it will rename the other style.
1. Use **Apply Styles** to apply styles that match layer name
1. Use **Detach Styles** to detach all the styles from the selected layers
1. Use **Remove Fill, Stroke, Text, Effect, and Grid** will delete the styles from the selected layers.
1. Use **Clear all Styles** will delete all the styles from the document.

## Notes

1. Any change can be **Undo**.
1. Only **Local Styles** are supported.
1. There is no support for **Groups** and I don't plan to support it.
1. The plugin, extract only text properties from text layers.
1. For layer that contains both fill and stroke properties, the plugin will add automatically a suffix to the style name `-fill` and `-stroke`, otherwise the style name will be exactly as the layer name.
