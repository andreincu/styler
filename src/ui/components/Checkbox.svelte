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
    max-width: 100%;
    margin: calc(-1 * (var(--checkbox-gutter)));
  }

  .checkbox-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--checkbox-size);
    margin: var(--checkbox-gutter);
    height: var(--checkbox-size);
  }

  /* checkbox-off */
  .checkbox-bg {
    position: relative;
    width: 18px;
    height: 18px;
    background: var(--checkbox-off);
    border-radius: 4px;
    transition: opacity 0.2s ease-out;
  }

  .checkbox-bg:before {
    position: absolute;
    display: block;
    content: '';
    left: 50%;
    top: 50%;
    transform-origin: center center;
    z-index: -1;
    border-radius: inherit;
    width: 100%;
    height: 100%;
  }

  label:hover .checkbox-bg {
    background: var(--action-secondary-hover);
    transition: background 0.2s ease-in;
  }

  input:checked ~ .checkbox-toggle .checkbox-bg {
    background: var(--checkbox-on);
  }

  label:hover input:checked ~ .checkbox-toggle .checkbox-bg {
    background: var(--action-primary-hover);
    transition: background 0.2s ease-in;
  }

  input:checked ~ .checkbox-toggle .checkbox-bg:before {
    animation: ripple 0.3s ease-out;
  }

  .checkbox-icon {
    position: absolute;
    display: block;
    content: '';
    left: 50%;
    top: 50%;
    transform-origin: center center;
    transform: translate(-50%, -50%) scale(0);
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: transform 0.2s ease-out;
  }

  input:checked ~ .checkbox-toggle .checkbox-icon {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  label span {
    line-height: 20px;
    margin: var(--checkbox-gutter);
  }

  @keyframes ripple {
    from {
      background: var(--checkbox-off);
      transform: translate(-50%, -50%) scale(0.9);
      opacity: 1;
    }
    to {
      background: var(--checkbox-on);
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
</style>

{#each checkboxes as checkbox}
  <label class="checkbox-group">
    <input type="checkbox" bind:checked bind:group value={checkbox.value} hidden />

    <div class="checkbox-toggle">
      <div class="checkbox-icon">
        <Icon bind:iconName />
      </div>
      <div class="checkbox-bg" />
    </div>

    <span>
      {#if checkboxes.length === 1}
        <slot />
      {:else}{checkbox.value}{/if}
    </span>
  </label>
{/each}
