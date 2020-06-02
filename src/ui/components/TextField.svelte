<script>
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let unitMeasurement = '';
</script>

<style>
  div {
    --unitMeasurement: '';
    --translate: 0, -50%;

    position: relative;
    width: 100%;
  }

  div:after {
    position: absolute;
    right: var(--size-xx-small);
    top: 50%;
    transform: translate(var(--translate));
    content: var(--unitMeasurement);
    font-size: inherit;
    font-weight: var(--text-weight-semibold);
    color: var(--text-color-faded);
    transition: transform var(--transition-x-fast) ease-in;
  }

  div:hover::after,
  div:focus-within::after,
  div:active::after,
  div:focus::after {
    --translate: var(--negative-size-small), -50%;
  }

  input {
    width: inherit;
    border: 1px solid var(--color-neutral-strong);
    background: var(--color-neutral-weak);
    padding: var(--size-xxx-small) var(--size-xx-small);
  }
</style>

<div style="--unitMeasurement: {unitMeasurement.toString()}">
  <input {type} {value} {placeholder} />
</div>
