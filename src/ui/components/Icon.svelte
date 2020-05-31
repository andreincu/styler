<script>
  let className = '';

  export { className as class };
  export let iconName = null;
</script>

<style>
  i {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>

<i class={className}>
  {@html iconName}
</i>
