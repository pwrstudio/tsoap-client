<script>
  // # # # # # # # # # # # # #
  //
  //  User list item
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { fade } from "svelte/transition";

  // PROPS
  export let player = {};
  export let header = false;
  export let numberOfUsers = 0;
</script>

<style lang="scss">
  @import "./variables.scss";

  .user-item {
    width: calc(100% - 20px);
    display: flex;
    margin-bottom: 10px;
    border-bottom: 1px solid $lightgrey;
    line-height: 1em;
    font-size: $font_size_small;

    div {
      width: calc(100% - 120px);
      white-space: nowrap;
      overflow: hidden;
      text-align: center;
      padding: 10px;

      &.small {
        width: 20px;
        height: 20px;
        // width: 20%;
        // text-align: left;
      }

      &.name {
        font-weight: bold;
      }

      &.mid {
        width: 40px;
        height: 20px;
        // width: 20%;
        // text-align: left;
      }

      &.color-code-outer {
        width: 40px;
        height: 30px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;

        .color-code {
          padding: 0;
          width: 20px;
          height: 20px;
          border-radius: 20px;
        }
      }
    }

    &.header {
      font-weight: bold;
    }
  }
</style>

<div class="user-item" class:header transition:fade>

  {#if header}
    <div class="small">
      <strong>{numberOfUsers}</strong>
    </div>
    <div>Name</div>
    <div class="mid">X</div>
    <div class="mid">Y</div>
  {:else}
    <div class="color-code-outer">
      <div
        class="color-code"
        style={'background-color:' + player.tint.replace('0X', '#')} />
    </div>
    <div class="name">{player.name}</div>
    <div class="mid">{player.x}</div>
    <div class="mid">{player.y}</div>
  {/if}
</div>
