<script>
  export let variant = 'primary';
  export let disabled = false;
  export let destructive = false;
  export { className as class };

  let className = '';
</script>

<style>
  button {
    display: inline-flex;
    justify-content: center;
    align-content: center;
    position: relative;
    font-size: var(--text-size-medium);
    line-height: var(--line-height-large);
    margin: 0;
    min-width: 8rem;
    padding: 0.3rem 1.2rem;
    border-radius: var(--border-radius-small);
    transition: background var(--transition-fast) ease-in;
  }

  button:focus {
    box-shadow: 0 0 0 0.2rem hsl(var(--color-invert-1));
    outline: 0;
  }

  .primary {
    background: hsl(var(--color-primary));
    color: hsl(var(--color-neutral-0));
    border: 1px solid hsl(var(--color-primary));
  }

  .secondary {
    background: transparent;
    color: hsl(var(--color-primary));
    border: 1px solid hsl(var(--color-neutral-2));
  }

  /* button:hover {
    background: hsla(var(--color-primary), 0.9);
  } */
</style>

<button on:click on:submit onclick="this.blur();" {variant} {disabled} class:destructive class="{variant} {className}">
  <slot />
</button>
