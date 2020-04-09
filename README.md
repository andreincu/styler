![cover](src/assets/cover.png)

# Styler

Styler is a plugin for Figma that generates styles based on selected layers.

## Features

- Generate Styles
- Apply Styles
- Detach Styles
- Remove Styles

## Usage

1. Select any number of layers
1. Don't bother with the names of the layers, you can rename it later, but try to not have the same name for multiple layers.
   > I recommend using bulk rename `Cmd` `R` (Mac) or `Ctrl` `R` (Windows)
1. **Generate Styles**
   - **Create:** creates styles, when there is no match between layer and existing styles.
   - **Rename:** renames styles, when there is a style attached to the layer and no style with desired new name.
   - **Update:** update styles, when there is a name match.
1. **Apply Styles:** apply styles to the selected layers.
1. **Detach Styles:** detach styles of the selected layers.
1. **Remove Styles:** remove styles based on the selected layers.
1. **Remove By Type:** _Fill_, _Stroke_, _Text_, _Effect_, _Grid_

## Known issues

1. [Figma limitation] While trying to rename the styles using underscore `_` or point `.` prefixes, the style will not change the publish status (it will not become unpublish). ☹️
1. [Figma limitation] After you create styles, you cannot reorder them using Figma API. 😔

## Notes

1. Any change can be **Undo**.
1. Only **Local Styles** are supported. Still... You can use external styles to update local ones.
1. There is no support for **Groups** and I don't plan to support it.
1. The plugin, extract only text properties from text layers.
1. For layer that contains both fill and stroke properties, the plugin will add automatically a suffix to the style name `-fill` and `-stroke`, otherwise the style name will be exactly as the layer name. I plan to expand this.

## Pairing well with

1. [Themer](https://github.com/thomas-lowry/themer)
1. [Match fills to local styles](https://www.figma.com/community/plugin/783240561193792353/Match-fills-to-local-styles)

Many thanks to [Cristi Nica](https://github.com/cristi9512) for support.  
Inspired by [Sketch Style Generator](https://github.com/lucaorio/sketch-styles-generator) made by **Luca Orio**.
