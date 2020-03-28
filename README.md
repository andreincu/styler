# Styler

Styler is a plugin for Figma that generates styles based on selected layers.

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

## Known issues

1. [Figma limitation] While trying to rename the styles using underscore `_` or point `.` prefixes, the style will not change the publish status (it will not become unpublish). ☹️
1. [Figma limitation] After you create styles, you cannot reorder them using Figma API. 😔

## Notes

1. Any change can be **Undo**.
1. Only **Local Styles** are supported.
1. There is no support for **Groups** and I don't plan to support it.
1. The plugin, extract only text properties from text layers.
1. For layer that contains both fill and stroke properties, the plugin will add automatically a suffix to the style name `-fill` and `-stroke`, otherwise the style name will be exactly as the layer name.

## Pairing well with

1. [Themer](https://github.com/thomas-lowry/themer)
1. [Match fills to local styles](https://www.figma.com/community/plugin/783240561193792353/Match-fills-to-local-styles)

Many thanks to [Cristi Nica](https://github.com/cristi9512) for support.  
Inspired by [Sketch Style Generator](https://github.com/lucaorio/sketch-styles-generator) made by **Luca Orio**.
