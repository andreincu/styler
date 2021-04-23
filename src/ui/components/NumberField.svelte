<script>
  import Icon from './Icon.svelte';
  import NotificationTimeout from './../assets/icons/time.svg';

  export let iconName = NotificationTimeout;
  export let value = '';
  export let placeholder = '';
  export let step = 1;
</script>

<style>
  label {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background: transparent;
    border: 1px solid hsl(var(--color-neutral-2));
    border-radius: var(--border-radius-small);
    overflow: hidden;
    font-size: var(--text-size-medium);
    font-weight: var(--text-weight-normal);
    line-height: var(--line-height-medium);
    color: hsl(var(--color-invert-2));
    transition: all var(--transition-fast) ease-out;
    margin: var(--size-xx-small) 0;
  }

  label:focus-within {
    box-shadow: 0 0 0 0.2rem hsl(var(--color-invert-0));
  }

  label:focus-within .left-side {
    color: hsl(var(--color-invert-0));
  }

  .left-side {
    flex: 1 1 auto;
    padding: 0.2rem;
    display: inherit;
    color: hsl(var(--color-invert-2));
  }

  .left-side .icon-container {
    display: inline-block;
    width: var(--size-small);
    height: var(--size-small);
    margin: 0.3rem;
    flex-shrink: 0;
    color: inherit;
  }

  .left-side .label {
    margin: 0.3rem;
  }

  .right-side {
    display: inline-flex;
    background: hsl(var(--color-neutral-0));
    outline: 1px solid hsl(var(--color-neutral-2));
    flex: 0 0 35%;
    padding: 0.2rem 0.9rem;
  }

  .right-side input {
    background: transparent;
    border: transparent;
    width: 100%;
    text-align: right;
    line-height: inherit;
    font-weight: var(--text-weight-bold);
    margin: 0.3rem;
  }

  .right-side input:focus {
    outline: transparent;
  }

  .right-side .unit-measure {
    margin: 0.3rem;
    color: hsl(var(--color-invert-3));
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    -moz-appearance: textfield;
  }

  .unit-measure:empty {
    display: none;
  }
</style>

<label for="unit-measure">
  <div class="left-side">
    <div class="icon-container">
      <Icon {iconName} />
    </div>
    <div class="label">
      <slot name="textfield-label" />
    </div>
  </div>
  <div class="right-side">
    <input id="unit-measure" type="number" bind:value {placeholder} {step} on:click={(event) => event.currentTarget.select()} />

    <div class="unit-measure">
      <slot name="unit-measure" />
    </div>

  </div>
</label>
