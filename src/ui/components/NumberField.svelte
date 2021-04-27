<script>
  import Icon from './Icon.svelte';
  import NotificationTimeout from '@assets/icons/time.svg';

  export let iconName = NotificationTimeout;
  export let value = '';
  export let placeholder = '';
  export let step = 1;
</script>

<style>
  label {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background: transparent;
    border: 1px solid hsl(var(--color-neutral-2));
    border-radius: var(--border-radius-small);
    overflow: hidden;
    font-size: var(--text-size-medium);
    font-weight: var(--text-weight-normal);
    line-height: var(--line-height-medium);
    color: hsl(var(--color-invert-2));
    transition: all var(--transition-fast) ease-out;
    margin: var(--size-xx-small) 0;
  }

  label:focus-within {
    box-shadow: 0 0 0 0.2rem hsl(var(--color-invert-0));
  }

  label:focus-within .left-side {
    color: hsl(var(--color-invert-0));
  }

  .left-side {
    flex: 1 1 auto;
    padding: 0.2rem;
    display: inherit;
    color: hsl(var(--color-invert-2));
  }

  .left-side .icon-container {
    display: inline-block;
    width: var(--size-small);
    height: var(--size-small);
    margin: 0.3rem;
    flex-shrink: 0;
    color: inherit;
  }

  .left-side .label {
    margin: 0.3rem;
  }

  .right-side {
    display: inline-flex;
    background: hsl(var(--color-neutral-0));
    outline: 1px solid hsl(var(--color-neutral-2));
    flex: 0 0 35%;
    padding: 0.2rem 0.9rem;
  }

  .right-side input {
    background: transparent;
    border: transparent;
    width: 100%;
    text-align: right;
    line-height: inherit;
    font-weight: var(--text-weight-bold);
    margin: 0.3rem;
  }

  .right-side input:focus {
    outline: transparent;
  }

  .right-side .unit-measure {
    margin: 0.3rem;
    color: hsl(var(--color-invert-3));
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    -moz-appearance: textfield;
  }

  .unit-measure:empty {
    display: none;
  }
</style>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
  <div class="left-side">
    <div class="icon-container">
      <Icon {iconName} />
    </div>
    <div class="label">
      <slot name="textfield-label" />
    </div>
  </div>
  <div class="right-side">
    <input id="unit-measure" type="number" bind:value {placeholder} {step} on:click={(event) => event.currentTarget.select()} />

    <div class="unit-measure">
      <slot name="unit-measure" />
    "rollup-plugin-html-bundle": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/rollup-plugin-html-bundle/-/rollup-plugin-html-bundle-0.0.3.tgz",
      "integrity": "sha512-vGMJTnpb57cT8p/BL2igUdohEAofxebRujd11Fk1ZY2zE0xGa3YMvzX4PH1kRUKm4nuQvFeW3ZdIksB9ZGzurw==",
      "dev": true
    },
    "rollup-plugin-scss": {
      "version": "3.0.0-rc1",
      "resolved": "https://registry.npmjs.org/rollup-plugin-scss/-/rollup-plugin-scss-3.0.0-rc1.tgz",
      "integrity": "sha512-hRDWaSCnQk5oo7au7UtYccML5ts4YopOtG6jhOzTxqY9dYg4FGUUl4gZSm18xNzikVzb073oum5C836/b9fwpg==",
      "dev": true,
      "requires": {
        "rollup-pluginutils": "^2.3.3"
      }
    },
    "rollup-plugin-svelte": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/rollup-plugin-svelte/-/rollup-plugin-svelte-7.1.0.tgz",
      "integrity": "sha512-vopCUq3G+25sKjwF5VilIbiY6KCuMNHP1PFvx2Vr3REBNMDllKHFZN2B9jwwC+MqNc3UPKkjXnceLPEjTjXGXg==",
      "dev": true,
      "requires": {
        "require-relative": "^0.8.7",
        "rollup-pluginutils": "^2.8.2"
      }
    },
    "rollup-plugin-svg": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/rollup-plugin-svg/-/rollup-plugin-svg-2.0.0.tgz",
      "integrity": "sha512-DmE7dSQHo1SC5L2uH2qul3Mjyd5oV6U1aVVkyvTLX/mUsRink7f1b1zaIm+32GEBA6EHu8H/JJi3DdWqM53ySQ==",
      "dev": true,
      "requires": {
        "rollup-pluginutils": "^1.3.1"
      },
      "dependencies": {
        "estree-walker": {
          "version": "0.2.1",
          "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-0.2.1.tgz",
          "integrity": "sha1-va/oCVOD2EFNXcLs9MkXO225QS4=",
          "dev": true
        },
        "rollup-pluginutils": {
          "version": "1.5.2",
          "resolved": "https://registry.npmjs.org/rollup-pluginutils/-/rollup-pluginutils-1.5.2.tgz",
          "integrity": "sha1-HhVud4+UtyVb+hs9AXi+j1xVJAg=",
          "dev": true,
          "requires": {
            "estree-walker": "^0.2.1",
            "minimatch": "^3.0.2"
          }
        }
      }
    },
    "rollup-pluginutils": {
      "version": "2.8.2",
      "resolved": "https://registry.npmjs.org/rollup-pluginutils/-/rollup-pluginutils-2.8.2.tgz",
      "integrity": "sha512-EEp9NhnUkwY8aif6bxgovPHMoMoNr2FulJziTndpt5H9RdwC47GSGuII9XxpSdzVGM0GWrNPHV6ie1LTNJPaLQ==",
      "dev": true,
      "requires": {
        "estree-walker": "^0.6.1"
      },
      "dependencies": {
        "estree-walker": {
          "version": "0.6.1",
          "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-0.6.1.tgz",
          "integrity": "sha512-SqmZANLWS0mnatqbSfRP5g8OXZC12Fgg1IwNtLsyHDzJizORW4khDfjPqJZsemPWBB2uqykUah5YpQ6epsqC/w==",
          "dev": true
        }
      }
    },
    "sass": {
      "version": "1.32.11",
      "resolved": "https://registry.npmjs.org/sass/-/sass-1.32.11.tgz",
      "integrity": "sha512-O9tRcob/fegUVSIV1ihLLZcftIOh0AF1VpKgusUfLqnb2jQ0GLDwI5ivv1FYWivGv8eZ/AwntTyTzjcHu0c/qw==",
