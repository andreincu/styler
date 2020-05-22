<script>
  const uiSettings = {
    filler: {
      prefix: '',
      suffix: '-test',
    },
    strokeer: {
      prefix: '',
      suffix: '-stroke',
    },
    effecter: {
      prefix: '',
      suffix: '',
    },
    grider: {
      prefix: '',
      suffix: '',
    },
    texter: {
      prefix: '',
      suffix: '',
    },

    notificationTimeout: 6000,
    framesPerContainer: 5,
  };

  onmessage = (e) => {
    const settings = e.data.pluginMessage.uiSettings;

    uiSettings.filler.prefix = settings.filler.prefix;
    uiSettings.filler.suffix = settings.filler.suffix;

    uiSettings.strokeer.prefix = settings.strokeer.prefix;
    uiSettings.strokeer.suffix = settings.strokeer.suffix;

    uiSettings.effecter.prefix = settings.effecter.prefix;
    uiSettings.effecter.suffix = settings.effecter.suffix;

    uiSettings.grider.prefix = settings.grider.prefix;
    uiSettings.grider.suffix = settings.grider.suffix;

    uiSettings.texter.prefix = settings.texter.prefix;
    uiSettings.texter.suffix = settings.texter.suffix;
  };

  const handleClick = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'save',
          uiSettings,
        },
      },
      '*',
    );
  };
</script>

<style>
  main {
    padding: 1rem;
    width: 100%;
    height: 100%;
  }

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
    <input type="number" bind:value="{uiSettings.notificationTimeout}" />

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
          <input type="text" bind:value="{uiSettings.filler.prefix}" placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value="{uiSettings.filler.suffix}" placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Strokes</td>
        <td>
          <input type="text" bind:value="{uiSettings.strokeer.prefix}" placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value="{uiSettings.strokeer.suffix}" placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Effects</td>
        <td>
          <input type="text" bind:value="{uiSettings.effecter.prefix}" placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value="{uiSettings.effecter.suffix}" placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Layout Grids</td>
        <td>
          <input type="text" bind:value="{uiSettings.grider.prefix}" placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value="{uiSettings.grider.suffix}" placeholder="No affix is set" />
        </td>
      </tr>
      <tr>
        <td>Texts</td>
        <td>
          <input type="text" bind:value="{uiSettings.texter.prefix}" placeholder="No affix is set" />
        </td>
        <td>
          <input type="text" bind:value="{uiSettings.texter.suffix}" placeholder="No affix is set" />
        </td>
      </tr>
    </table>

    <h2>Number of frames per row</h2>
    <input type="number" bind:value="{uiSettings.framesPerContainer}" />
  </div>
  <div class="footer">
    <button class="button button--primary" on:click|once="{handleClick}">
      Save settings
    </button>
  </div>
</main>
