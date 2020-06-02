<script>
  import Checkbox from './components/Checkbox';
  import Button from './components/Button';
  import TextField from './components/TextField';

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

  const previousExplainer = 'This option will change your styles description, by adding the previous style at update.';
  const updateusingLocalExplainer = 'When this option is enabled, update and rename behaviour are changed.';

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

  section {
    padding: var(--size-xx-small) var(--size-x-small);
  }
</style>

<main>

  <section>
    <h1 class="h2">Customize plugin</h1>

    <h2 class="h3">Notification timeout</h2>
    <TextField type="number" bind:value={notificationTimeout} unitMeasurement="'ms'" />

    <h2 class="h3">Number of frames per row</h2>
    <TextField type="number" bind:value={framesPerContainer} unitMeasurement="'frames'" />

    <Checkbox bind:checked={addPreviousStyleToDescription} note={previousExplainer}>
      Show previous style in description
    </Checkbox>

    <Checkbox bind:checked={updateUsingLocalStyles} note={updateusingLocalExplainer}>
      Update using local styles
    </Checkbox>
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
    <Button on:click={handleClick}>Save settings</Button>
  </section>
</main>
