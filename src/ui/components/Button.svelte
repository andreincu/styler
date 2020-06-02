<script>
  import { onMount } from 'svelte';

  export let variant = 'primary';
  export let disabled = false;
  export let destructive = false;
  export { className as class };

  let className = '';
</script>

<style lang="scss">
  button {
    display: inline-flex;
    justify-content: center;
    align-content: center;
    position: relative;
    background: var(--color-primary-base);
    color: var(--text-color-contrast);
    font-size: var(--text-size-medium);
    border: 0;
    margin: 0;
    min-width: 8rem;
    padding: var(--size-xx-small);
    border-radius: var(--border-radius-small);
    transition: background var(--transition-fast) ease-in;
  }

  button:hover {
    background: var(--color-primary-strong);
  }
</style>

<button on:click on:submit onclick="this.blur();" {variant} {disabled} class:destructive class:variant class:className>
  <slot />
</button>
