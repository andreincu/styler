<script>
  import Checkmark from '@assets/icons/checkmark.svg';
  import Warning from '@assets/icons/warning.svg';
  import Icon from '@components/Icon.svelte';

  export let iconName = Checkmark;
  export let checked = false;
  export let checkboxes = [{ value: '' }];
  export let group = [];
  export let show = false;
</script>

<style>
  label {
    display: flex;
    margin: var(--size-xx-small) 0;
    color: hsl(var(--color-invert-2));
  }

  input {
    position: absolute;
    width: var(--size-small);
    height: var(--size-small);
    z-index: -1;
    opacity: 0;
  }

  input:focus {
    outline: 0;
  }

  .checkbox-toggle {
    position: relative;
    flex: 0 0 var(--size-medium);
    height: var(--size-medium);
  }

  .checkbox-toggle:before,
  .checkbox-toggle:after {
    background: hsl(var(--color-neutral-0));
    border: 1px solid hsl(var(--color-neutral-2));
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    content: '';
    width: 1.8rem;
    height: 1.8rem;
    opacity: 1;
    border-radius: var(--border-radius-small);
    transition: all var(--transition-fast) ease-out;
    filter: brightness(100%);

    transform-origin: center center;
    transform: translate(var(--translate)) rotate(var(--rotate)) scale(var(--scale));
  }

  .checkbox-toggle:before {
    z-index: -2;
  }
  .checkbox-toggle:after {
    z-index: -1;
  }

  label:hover .checkbox-toggle:after {
    filter: brightness(80%);
  }

  input:checked ~ .checkbox-toggle:after,
  input:checked ~ .checkbox-toggle:before {
    background: hsl(var(--color-primary));
    border-color: hsl(var(--color-primary));
  }

  input:checked ~ .checkbox-toggle:before {
    opacity: 0;
    --scale: 1.75;
  }

  .checkbox-icon {
    display: inline-block;
    width: 100%;
    height: 100%;
    transform: scale(0);
    color: hsl(var(--color-invert-1));
    transition: transform var(--transition-fast) ease-out;
  }

  input:checked ~ .checkbox-toggle .checkbox-icon {
    transform: scale(1);
    opacity: 1;
  }

  .label {
    display: inline-flex;
    flex: 1 1 auto;
    margin: 0.2rem 0.8rem;
    justify-content: space-between;
  }

  .helper {
    font-size: var(--text-size-small);
    font-weight: var(--text-weight-normal);
    margin: 0;
    line-height: var(--line-height-large);
    color: hsl(var(--color-invert-2));
  }

  .checkbox-icon :global(.icon-color) {
    color: hsl(var(--color-neutral-0));
  }

  input:focus ~ .checkbox-toggle::after {
    box-shadow: 0 0 0 0.2rem hsl(var(--color-invert-0));
  }

  .icon-helper {
    flex-shrink: 0;
    display: none;
    width: 2rem;
    height: 2rem;
    margin: 0 -0.8rem;
    color: hsl(var(--color-invert-3));
  }

  .icon-helper.show {
    display: block;
  }

  .helper:empty {
    display: none;
  }
</style>

{#each checkboxes as checkbox}
  <label>
    <input type="checkbox" bind:group value={checkbox.value} bind:checked />

    <div class="checkbox-toggle">
      <div class="checkbox-icon">
        <Icon {iconName} class="icon-color" />
      </div>
    </div>

    <div class="label">
      <span>
        {#if checkboxes.length === 1}
          <slot name="label" />
        {:else}{checkbox.value}{/if}
      </span>

      <div class="icon-helper" class:show>
        <Icon iconName={Warning} />
      </div>
    </div>

    <div class="helper">
      <slot name="helper" />
    </div>
  </label>
{/each}
