<script>
  import Checkmark from './../assets/icons/checkmark.svg';
  import Icon from './Icon.svelte';

  export let iconName = Checkmark;
  export let checked = false;
  export let checkboxes = [{ value: '' }];
  export let group = [];
</script>

<style lang="scss">
  .checkbox-group {
    display: flex;
    margin: var(--negative-size-xxx-small);
  }

  .checkbox-toggle {
    position: relative;
    flex: 0 0 var(--size-small);
    height: var(--size-small);
    margin: var(--size-xxx-small);
  }

  .checkbox-toggle:before,
  .checkbox-toggle:after {
    background: var(--color-secondary-base);
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    content: '';
    width: 75%;
    height: 75%;
    opacity: 1;
    border-radius: var(--size-xxx-small);
    transition: all var(--transition-fast) ease-out;
    filter: brightness(100%);

    transform-origin: center center;
    transform: translateX(var(--translate-x)) translateY(var(--translate-y)) rotate(var(--rotate)) scale(var(--scale));
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

  input:checked ~ .checkbox-toggle:after {
    background: var(--color-primary-base);
  }

  input:checked ~ .checkbox-toggle:before {
    background: var(--color-primary-base);
    opacity: 0;
    --scale: 1.5;
  }

  .checkbox-icon {
    display: inline-block;
    width: 100%;
    height: 100%;
    transform: scale(0);
    transition: transform var(--transition-fast) ease-out;
  }

  input:checked ~ .checkbox-toggle .checkbox-icon {
    transform: scale(1);
    opacity: 1;
  }

  label span {
    margin: var(--size-xxx-small);
  }
</style>

{#each checkboxes as checkbox}
  <label class="checkbox-group">
    <input type="checkbox" bind:checked bind:group value={checkbox.value} hidden />

    <div class="checkbox-toggle">
      <div class="checkbox-icon">
        <Icon {iconName} />
      </div>
    </div>

    <span>
      {#if checkboxes.length === 1}
        <slot />
      {:else}{checkbox.value}{/if}
    </span>
  </label>
{/each}
