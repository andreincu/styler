<script>
  let className = '';

  export { className as class };
  export let iconName = null;
</script>

<style>
  .svg-icon {
    color: inherit;
    display: block;
    width: 100%;
    height: 100%;
  }

  :global(.svg-icon *) {
    fill: currentColor;
  }
</style>

<i class="svg-icon {className}">
  {@html iconName}
</i>
