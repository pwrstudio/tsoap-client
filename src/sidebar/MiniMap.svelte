<script>
  // # # # # # # # # # # # # #
  //
  //  Minimap
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"

  // *** PROPS
  export let miniImage = false
  export let player = false
</script>

<style lang="scss">
  @import "../variables.scss";

  .map-container {
    height: 200px;
    width: 200px;
    position: relative;
    transform: scale(0.95);
    user-select: none;

    img {
      height: 200px;
      width: 200px;
    }

    .map-marker {
      height: 10px;
      width: 10px;
      border-radius: 5px;
      background: white;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
    }
  }
</style>

<div class="map-container">
  {#if miniImage}<img src={miniImage} alt="minimap" />{/if}
  {#if get(player, 'avatar.y', false) && get(player, 'avatar.x', false)}
    <div
      class="map-marker"
      style={'top: ' + Math.round(player.avatar.y / 20 - 5) + 'px; left: ' + Math.round(player.avatar.x / 20 - 5) + 'px;'} />
  {/if}
</div>
