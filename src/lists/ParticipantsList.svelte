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
  export let messaging = false
</script>

<style lang="scss">
  @import "../variables.scss";

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: $COLOR_DARK;
    }

    svg {
      margin-left: -4px;
      path {
        fill: $COLOR_MID_2;
      }
      &:hover {
        path {
          fill: $COLOR_DARK;
        }
      }
    }
  }
</style>

{#if participants && Array.isArray(participants)}
  {#each participants as participant, index}
    <a
      href={'/profiles/' + get(participant, 'slug.current', '')}>{participant.name}</a>
    {#if $localUserAuthenticated && messaging && participant.username}
      <a
        href={'https://work.anthropocene-curriculum.org/new-message?username=' + participant.username}
        target="_blanks">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="18"
          viewBox="0 0 24 24"
          width="18">
          <path
            d="M4 4h16v12H5.17L4 17.17V4m0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4zm2 10h12v2H6v-2zm0-3h12v2H6V9zm0-3h12v2H6V6z" />
        </svg>
      </a>
    {/if}
  {/each}
{/if}
