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
</script>

<UserItem header={true} numberOfUsers={Object.entries(playerList).length} />
{#each Object.entries(playerList) as player (player[1].uuid)}
  <UserItem player={player[1]} />
{/each}
