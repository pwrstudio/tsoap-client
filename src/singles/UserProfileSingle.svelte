<script>
  // # # # # # # # # # # # # #
  //
  //  Single User Profile
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"

  import { QUERY } from "../global.js"

  // *** PROPS
  export let user = {}

  // const relatedEvents = loadData(QUERY.RELATED_EVENTS, {id: user._id})
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .user-profile-single {
    .main-header {
      padding: 15px;

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: 500;
      }

      .participants {
        color: $COLOR_MID_2;
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        display: inline-block;
      }
    }

    .divider {
      border-bottom: 1px dotted $COLOR_MID_1;
      width: 100%;
    }

    .text {
      padding: 15px;
      font-family: $SANS_STACK;
      font-size: $FONT_SIZE_BASE;
      font-weight: 400;
      line-height: 1.4em;
    }

    .related-events {
      padding: 15px;
    }
  }
</style>

<div class="user-profile-single" in:fade use:links>
  <!-- HEADER -->

  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{user.name}</div>
  </div>
  <div class="divider" />

  <!-- BIOGRAPHY -->
  {#if Array.isArray(get(user, 'biography.content', false))}
    <div class="text">
      {@html renderBlockText(user.biography.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- RELATED EVENTS -->
  <!-- <div class="related-events"> -->
  <!-- {await relatedEvents then relatedEvents} -->
  <!-- {#if Array.isArray(get(user, 'connectedEvents', false))}
      <Calendar events={user.connectedEvents} related={true} />
    {/if} -->
  <!-- {/await} -->
  <!-- </div> -->
</div>
