// Figma Design System made by Thomas Lowry
// https://thomas-lowry.github.io/figma-plugin-ds/#intro
import './scripts/figma-plugin-ds.min.js';
import './styles/figma-plugin-ds.min.css';

import './styles/main.scss';

onmessage = (event) => {
  const counter = event.data.pluginMessage;
  const counterArray = Object.entries(counter);

  const counterMessages = {
    applied: 'Applied',
    created: 'Created',
    detached: 'Detached',
    extracted: 'Extracted',
    ignored: 'Not changed',
    renamed: 'Renamed',
    removed: 'Removed',
    updated: 'Updated',
  };

  // counterArray.map(([key, value]) => {
  //   if (value === 0) return;

  //   let el = document.querySelector('.visual-bell').appendChild(document.createElement('span'));
  //   el.className = 'visual-bell__msg';
  //   el.innerHTML = `${counterMessages[key]}:  ${value}`;
  // });
};
