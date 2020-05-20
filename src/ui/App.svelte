<script>
  const settings = {
    filler: {
      prefix: '',
      suffix: ''
    },
    strokeer: {
      prefix: '',
      suffix: '-stroke'
    },
    effecter: {
      prefix: '',
      suffix: ''
    },
    grider: {
      prefix: '',
      suffix: ''
    },
    texter: {
      prefix: '',
      suffix: ''
    },
    notificationTimeout: 6000,
    framesPerContainer: 5,
  }

  const handleClick = () => {
    parent.postMessage({ pluginMessage: settings }, "*")
  }

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
    padding: .25rem;
  }

  table input {
    width: 100%;

  }

  input {
    border: 1px solid lightgrey;
    padding: .25rem;
  }
</style>

<main>
  <div>

    <h1>Advanced settings</h1>
    <h2>Notification timeout</h2>
    <input type="number" bind:value={settings.notificationTimeout}>

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
          <input type="text" bind:value={settings.filler.prefix} placeholder="No affix is set">
        </td>
        <td>
          <input type="text" bind:value={settings.filler.suffix} placeholder="No affix is set">
        </td>
      </tr>
      <tr>
        <td>Strokes</td>
        <td>
          <input type="text" bind:value={settings.strokeer.prefix} placeholder="No affix is set">
        </td>
        <td>
          <input type="text" bind:value={settings.strokeer.suffix} placeholder="No affix is set">
        </td>
      </tr>
      <tr>
        <td>Effects</td>
        <td>
          <input type="text" bind:value={settings.effecter.prefix} placeholder="No affix is set">
        </td>
        <td>
          <input type="text" bind:value={settings.effecter.suffix} placeholder="No affix is set">
        </td>
      </tr>
      <tr>
        <td>Layout Grids</td>
        <td>
          <input type="text" bind:value={settings.grider.prefix} placeholder="No affix is set">
        </td>
        <td>
          <input type="text" bind:value={settings.grider.suffix} placeholder="No affix is set">
        </td>
      </tr>
      <tr>
        <td>Texts</td>
        <td>
          <input type="text" bind:value={settings.texter.prefix} placeholder="No affix is set">
        </td>
        <td>
          <input type="text" bind:value={settings.texter.suffix} placeholder="No affix is set">
        </td>
      </tr>
    </table>

    <h2>Number of frames per row</h2>
    <input type="number" bind:value={settings.framesPerContainer}>
  </div>
  <div class="footer">
    <button class="button button--primary" on:click|once={handleClick}>
      Save settings
    </button>
  </div>


</main>