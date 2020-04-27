// import modifiedName from './modifiedName';

// // removing all local styles
// export default (style, styleType, figmaCommand, counter) => {
//   const commandAffix = {
//     prefix: 'remove',
//     suffix: 'styles',
//   };
//   const modifiedCommand = figmaCommand.toLocaleLowerCase();
//   const modifiedTypeName = modifiedName(styleType.type, commandAffix).toLocaleLowerCase();

//   if (style && modifiedCommand === modifiedTypeName) {
//     style.remove();
//     counter.removed++;
//   } else {
//     counter.ignored++;
//   }
// };
