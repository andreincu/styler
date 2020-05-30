<script>
  import Checkbox from './svelte-components/Checkbox.svelte';

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

<style>
  table {
    width: 100%;
    text-align: left;
    margin: 0 -0.25rem;
    border-collapse: collapse;
    table-layout: fixed;
  }

  table th,
  table td {
    padding: 0.25rem;
  }

  table input {
    width: 100%;
  }

  input {
    border: 1px solid lightgrey;
    padding: 0.25rem;
  }
</style>

<main>
  <div>
    <h1>Advanced settings</h1>
    <h2>Notification timeout</h2>
    <input type="number" bind:value={notificationTimeout} />

    <h2>Number of frames per row</h2>
    <input type="number" bind:value={framesPerContainer} />

    <Checkbox bind:checked={addPreviousStyleToDescription}>Show previous style in description</Checkbox>

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
          <input type="text" bind:value={filler.prefix} placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value={filler.suffix} placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Strokes</td>
        <td>
          <input type="text" bind:value={strokeer.prefix} placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value={strokeer.suffix} placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Effects</td>
        <td>
          <input type="text" bind:value={effecter.prefix} placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value={effecter.suffix} placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Layout Grids</td>
        <td>
          <input type="text" bind:value={grider.prefix} placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value={grider.suffix} placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Texts</td>
        <td>
          <input type="text" bind:value={texter.prefix} placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value={texter.suffix} placeholder="No affix is set" />
        </td>
      </tr>
    </table>

  </div>

  <button>Save settings</button>
</main>
