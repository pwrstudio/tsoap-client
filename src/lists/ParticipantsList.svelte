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
  @import "../variables.scss";

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>

{#each participants as participant, index}
  <a
    href={'/profiles/' + get(participant, 'slug.current', '')}>{participant.name}{#if index < participants.length - 1}
      ,
    {/if}</a>
{/each}
