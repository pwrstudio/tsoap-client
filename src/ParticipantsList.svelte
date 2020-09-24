<script>
  // # # # # # # # # # # # # #
  //
  //  Participants
  //
  // # # # # # # # # # # # # #
  // IMPORTS
  import get from "lodash/get"
  // *** PROPS
  export let participants = {}
</script>

<style lang="scss">
  @import "./variables.scss";

  a {
    color: inherit;
    text-decoration: none;
  }
</style>

{#each participants as participant, index}
  <a
    href={get(participant, 'slug.current', '')}>{participant.name}{#if index < participants.length - 1},{/if}</a>
  <!-- {index} {participants.length} -->
  <!-- {#if index == participants.length - 2}
    &nbsp;&amp;&nbsp; -->
{/each}
