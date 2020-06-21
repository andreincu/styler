<script>
  import { onMount } from 'svelte';
  import { defaultSettings } from '../code/modules/default-settings';
  import IconFrame from './assets/icons/frame-layers.svg';
  import IconText from './assets/icons/text-layers.svg';
  import Checkbox from './components/Checkbox';
  import Button from './components/Button';
  import NumberField from './components/NumberField';

  let uiSettings = { ...defaultSettings };
  let showAlert = false;

  onMount(() => {
    window.focus();
  });

  const updateSettings = (currentSettings, newSettings = defaultSettings) => {
    Object.keys(newSettings).map((key) => {
      currentSettings[key] = newSettings[key];
    });

    return currentSettings;
  };

  onmessage = async (e) => {
    const codeSettings = e.data.pluginMessage;
    // console.log('in ui msg:');
    // console.log(e.data.pluginMessage);

    uiSettings = updateSettings(uiSettings, codeSettings);
  };

  const saveSettings = () => {
    const { fillerPrefix, fillerSuffix, strokeerPrefix, strokeerSuffix } = uiSettings;
    if (fillerPrefix === strokeerPrefix && fillerSuffix === strokeerSuffix) {
      showAlert = true;
    } else {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'save-settings',
            uiSettings,
          },
        },
        '*',
      );
    }
  };

  const resetToDefault = () => {
    uiSettings = updateSettings(uiSettings, defaultSettings);

    return uiSettings;
  };

  const cancelModalUsingEscape = (event) => {
    if (event.key === 'Escape') {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'cancel-modal',
          },
        },
        '*',
      );
    }
  };
</script>

<style lang="scss">
  main {
    padding-bottom: 6.4rem;
  }
  main div {
    padding: 0 var(--size-x-small);
  }

  footer {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: hsl(var(--color-neutral-0));
    box-shadow: 0px 0px 1.6rem hsla(var(--color-invert-0), 0.05);
    padding: 0.4rem 1.2rem;
  }

  footer :global(.col) {
    flex: 1 1 auto;
    margin: 0.4rem;
  }
</style>

<main>
  <div>
    <h2 class="caption">General</h2>
    <NumberField bind:value={uiSettings.notificationTimeout} step="1000">
      <span slot="textfield-label">Notification duration</span>
      <span slot="unit-measure">ms</span>
    </NumberField>
  </div>

  <div>
    <h2 class="caption">Generate styles</h2>
    <Checkbox bind:checked={uiSettings.addPrevToDescription}>
      <span slot="label">Show last style in description</span>
    </Checkbox>

    <Checkbox bind:checked={uiSettings.updateUsingLocalStyles}>
      <span slot="label">Update using local styles</span>
    </Checkbox>

    <Checkbox bind:checked={uiSettings.partialMatch}>
      <span slot="label">Extend name match</span>
    </Checkbox>
  </div>

  <div>
    <h2 class="caption">Extract Styles</h2>
    <NumberField bind:value={uiSettings.textsPerSection} iconName={IconText}>
      <span slot="textfield-label">Texts per column</span>
      <span slot="unit-measure">layers</span>
    </NumberField>

    <NumberField bind:value={uiSettings.framesPerSection} iconName={IconFrame}>
      <span slot="textfield-label">Frames per row</span>
      <span slot="unit-measure">layers</span>
    </NumberField>
  </div>

</main>
<footer>
  <Button on:click={resetToDefault} variant="secondary" class="col">Reset to default</Button>
  <Button on:click={saveSettings} class="col">Save settings</Button>
</footer>

<svelte:window on:keydown={cancelModalUsingEscape} />
