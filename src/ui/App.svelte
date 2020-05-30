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
    margin: 0 -0.25rem;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.875rem;
  }

  table th,
  table td {
    padding: 0.25rem;
  }

  table input {
    width: 100%;
  }

  section {
    padding: 0.25rem 1rem;
  }

  main {
    padding: 0.5rem 0;
  }

  button {
    width: 100%;
  }
</style>

<main>

  <section>
    <h2>Customize plugin</h2>
  </section>
  <section>
    <h3>Notification timeout</h3>
    <input type="number" bind:value={notificationTimeout} />
  </section>

  <section>
    <h3>Number of frames per row</h3>
    <input type="number" bind:value={framesPerContainer} />
  </section>

  <section>
    <Checkbox bind:checked={addPreviousStyleToDescription}>Show previous style in description</Checkbox>
  </section>

  <section>
    <h3>Style settings</h3>
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
