<script>
  // # # # # # # # # # # # # #
  //
  //  User list
  //
  // # # # # # # # # # # # # #

  // COMPONENTS
  import UserItem from "./UserItem.svelte";

  // PROPS
  export let playerList = [];
  export let phoneActive = false;
</script>

<style lang="scss">
  @import "./variables.scss";

  .user-list {
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 50vh;
    background: lightgray;
    padding: 10px;
    padding-top: 10px;
    overflow: scroll;
    padding-bottom: 200px;
    z-index: 100;

    @include screen-size("small") {
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5 ease-out;
      padding-top: 80px;

      &.phone {
        opacity: 1;
        pointer-events: all;
      }
    }
  }
</style>

<div class="user-list" class:phone={phoneActive}>
  <UserItem header={true} numberOfUsers={playerList.length} />
  {#each playerList as player}
    <UserItem {player} />
  {/each}
</div>
