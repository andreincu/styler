<script>
  import Checkbox from './components/Checkbox.svelte';

  let filler = {
    prefix: '',
    suffix: '',
  };
  let strokeer = {
    prefix: '',
    suffix: '-stroke',
  };
  let effecter = {
    prefix: '',
    suffix: '',
  };
  let grider = {
    prefix: '',
    suffix: '',
  };
  let texter = {
    prefix: '',
    suffix: '',
  };

  let notificationTimeout = 6000;
  let framesPerContainer = 5;
  let addPreviousStyleToDescription = false;
  let updateUsingLocalStyles = false;

  onmessage = (e) => {
    const codeSettings = e.data.pluginMessage.codeSettings;

    if (!codeSettings) {
      return;
    }

    if (codeSettings.filler) {
      filler = codeSettings.filler;
    }
    if (codeSettings.strokeer) {
      strokeer = codeSettings.strokeer;
    }
    if (codeSettings.effecter) {
      effecter = codeSettings.effecter;
    }
    if (codeSettings.grider) {
      grider = codeSettings.grider;
    }
    if (codeSettings.texter) {
      texter = codeSettings.texter;
    }

    if (codeSettings.notificationTimeout) {
      notificationTimeout = codeSettings.notificationTimeout;
    }
    if (codeSettings.framesPerContainer) {
      framesPerContainer = codeSettings.framesPerContainer;
    }
    if (codeSettings.addPreviousStyleToDescription) {
      addPreviousStyleToDescription = codeSettings.addPreviousStyleToDescription;
    }
    if (codeSettings.updateUsingLocalStyles) {
      updateUsingLocalStyles = codeSettings.updateUsingLocalStyles;
    }
  };

  const handleClick = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'save-settings',
          uiSettings: {
            filler,
            strokeer,
            effecter,
            grider,
            texter,
            notificationTimeout,
            framesPerContainer,
            addPreviousStyleToDescription,
            updateUsingLocalStyles,
          },
        },
      },
      '*',
    );
  };
</script>

<style lang="scss">
  table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    table-layout: fixed;
  }

  input {
    width: 100%;
    border: 1px solid grey;
  }

  section {
    padding: var(--size-xx-small) var(--size-x-small);
  }

  button {
    width: 100%;
  }
</style>

<main>

  <section>
    <h1>Customize plugin</h1>

    <h2>Notification timeout</h2>
    <input type="number" bind:value={notificationTimeout} />

    <h2>Number of frames per row</h2>
    <input type="number" bind:value={framesPerContainer} />

    <Checkbox bind:checked={addPreviousStyleToDescription}>Show previous style in description</Checkbox>

    <Checkbox bind:checked={updateUsingLocalStyles}>Update using local styles</Checkbox>
  </section>

  <section>
    <h2>Style settings</h2>
    <table>
      <tr>
        <th>Style type</th>
        <th>Prefix</th>
        <th>Suffix</th>
      </tr>
      <tr>
        <td>Fills</td>
        <td>
          <input type="text" bind:value={filler.prefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={filler.suffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Strokes</td>
        <td>
          <input type="text" bind:value={strokeer.prefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={strokeer.suffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Effects</td>
        <td>
          <input type="text" bind:value={effecter.prefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={effecter.suffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Layout Grids</td>
        <td>
          <input type="text" bind:value={grider.prefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={grider.suffix} placeholder="" />
        </td>
      </tr>
      <tr>
        <td>Texts</td>
        <td>
          <input type="text" bind:value={texter.prefix} placeholder="" />
        </td>
        <td>
          <input type="text" bind:value={texter.suffix} placeholder="" />
        </td>
      </tr>
    </table>
  </section>

  <section>
    <button on:click={handleClick}>Save settings</button>
  </section>
</main>
