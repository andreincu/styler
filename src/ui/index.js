import App from './App.svelte';
import '../scripts/figma-plugin-ds.min.js';
import '../styles/figma-plugin-ds.min.css';
import '../styles/main.scss';

const app = new App({
  target: document.body,
  props: {},
});

export default app;
