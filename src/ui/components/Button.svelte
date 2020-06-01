<script>
  import { onMount } from 'svelte';

  export let variant = 'primary';
  export let disabled = false;
  export let destructive = false;
  export { className as class };

  let className = '';
</script>

<style>
  .primary {
    color: red;
  }
</style>

<button on:click on:submit onclick="this.blur();" {variant} {disabled} class:destructive class="{variant} {className}">
  <slot />
</button>
