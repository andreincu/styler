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
    margin: -0.25rem;
  }

  .checkbox-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 24px;
    margin: 0.25rem;
    height: 24px;
  }

  /* checkbox-off */
  .checkbox-bg {
    position: relative;
    width: 18px;
    height: 18px;
    background: var(--component-checkbox-off);
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
    background: lighten(red, 10%);
  }

  input:checked ~ .checkbox-toggle .checkbox-bg {
    opacity: 1;
    background: var(--component-checkbox-on);
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
    line-height: 24px;
    margin: 0.25rem;
  }

  @keyframes ripple {
    from {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    to {
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
