<script>
  import { onMount } from 'svelte';
  import { defaultSettings } from '../code/modules/default-settings';
  import Checkbox from './components/Checkbox';
  import Button from './components/Button';
  import TextField from './components/TextField';

  let uiSettings = { ...defaultSettings };
  let showAlert = false;

  const previousExplainer = 'This option will change your styles description, by adding the previous style at update.';
  const updateusingLocalExplainer = 'When this option is enabled, update and rename behaviour are changed.';

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
  table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    table-layout: fixed;
  }

  section {
    padding: var(--size-xx-small) var(--size-x-small);
  }

  input[showAlert='true'] {
    border: 1px solid red;
  }
</style>

<main>

  <section>
    <h1 class="h2">Customize plugin</h1>

    <h2 class="h3">Notification timeout</h2>
    <TextField type="number" bind:value={uiSettings.notificationTimeout} unitMeasurement="'ms'" />

    <h2 class="h3">Number of texts per section</h2>
    <TextField type="number" bind:value={uiSettings.textsPerSection} unitMeasurement="'frames'" />

    <h2 class="h3">Number of frames per section</h2>
    <TextField type="number" bind:value={uiSettings.framesPerSection} unitMeasurement="'frames'" />

    <Checkbox bind:checked={uiSettings.addPrevToDescription} note={previousExplainer}>
      Show previous style in description
    </Checkbox>

    <Checkbox bind:checked={uiSettings.updateUsingLocalStyles} note={updateusingLocalExplainer}>
      Update using local styles
    </Checkbox>

    <Checkbox bind:checked={uiSettings.partialMatch} note={'nimic'}>Expand style name match</Checkbox>
  </section>

  <section>
    <h2 class="h3">Style settings</h2>
    <table>
      <tr>
        <th>Style type</th>
        <th>Prefix</th>
        <th>Suffix</th>
      </tr>
      <tr>
        <td>Fills</td>
        <td>
          <input type="text" bind:value={uiSettings.fillerPrefix} placeholder="" {showAlert} />
        </td>
        <td>
          <input type="text" bind:value={uiSettings.fillerSuffix} placeholder="" {showAlert} />
        </td>
      </tr>
      <tr>
        <td>Strokes</td>
        <td>
          <input type="text" bind:value={uiSettings.strokeerPrefix} placeholder="" {showAlert} />
        </td>
        <td>
          <input type="text" bind:value={uiSettings.strokeerSuffix} placeholder="" {showAlert} />
        </td>
      </tr>
      <tr>
        <td>Effects</td>
        <td>
          <input type="text" bind:value={uiSettings.effecterPrefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={uiSettings.effecterSuffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Layout Grids</td>
        <td>
          <input type="text" bind:value={uiSettings.griderPrefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={uiSettings.griderSuffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Texts</td>
        <td>
          <input type="text" bind:value={uiSettings.texterPrefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={uiSettings.texterSuffix} placeholder="" />
        </td>
      </tr>
    </table>
  </section>

  <section>
    <Button on:click={saveSettings}>Save settings</Button>
    <Button on:click={resetToDefault}>Reset to default</Button>
  </section>

</main>

<svelte:window on:keydown={cancelModalUsingEscape} />
