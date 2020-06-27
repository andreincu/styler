# Changelog

## 1.0.0

- new icon and cover image 🌟
- added new action called _Extract styles_
- added UI to customize plugin
- updated the messages for all notifications
- now it is possible to get the other properties of a text layer by adding `+` symbol before layer name
- now is possible to use local styles in order to rename a style. For this, you need to change settings in the _Customize plugin_ section
- now is possible to change the duration of notifications and cancel it
- now, only _stroke type_ styles will have suffix
- now, styles will be created in the same order as layers order (as you see at layers panel from top to bottom)
- grouped all _remove_ action into a single menu item
- added logic for changing prefixes and suffixes, but didn't expose to the user (decided at the end that will only create issues between users, as settings are saved on localStorage)
- refactored the entire code: now there is a class to resolve the inconsistency between layer props and style props
- used svelte as UI framework (played with it), but unfortunately with webpack, as results there were some drawbacks 😅

## 0.0.1

- changed clear all styles to `Remove Styles` and now is based on selection
- changed generate function behaviour -- now it is possible to use another style to update an existing one
- created changelog file
- cleanup code (still ugly, but cleaner than before)

## 0.0.0

- added generate styles based on selected layers (create, update, rename)
- added apply styles that match the layer name
- added detach styles
- added remove styles by type
- added clear all styles (Remove all styles from the document)
- still defining the features
