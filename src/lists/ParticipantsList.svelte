<script>
  // # # # # # # # # # # # # #
  //
  //  Participants
  //
  // # # # # # # # # # # # # #
  // IMPORTS
  import get from "lodash/get"

  // *** STORES
  import { localUserAuthenticated } from "../stores"

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

{#if participants && Array.isArray(participants)}
  {#each participants as participant, index}
    <a
      href={'/profiles/' + get(participant, 'slug.current', '')}>{participant.name}</a>
    {#if $localUserAuthenticated}
      <a
        href={'/messages/' + get(participant, 'slug.current', '')}>(Message)</a>
    {/if}
  {/each}
{/if}
