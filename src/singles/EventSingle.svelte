<script>
  // # # # # # # # # # # # # #
  //
  //  Single Event
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { urlFor, renderBlockText } from "../sanity.js"
  import { links } from "svelte-routing"

  // COMPONENTS
  import ParticipantsList from "../ParticipantsList.svelte"

  // GLOBAL
  import { formattedDate } from "../global.js"

  // *** PROPS
  export let event = {}

  console.dir(event)
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .event-single {
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

    .date {
      padding: 15px;
      text-align: center;
      font-weight: 500;
      font-family: $SANS_STACK;
    }

    .image {
      width: 100%;
      padding-top: 15px;
      padding-bottom: 15px;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
      }
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

<div class="event-single" in:fade use:links>
  <!-- HEADER -->
  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{event.title}</div>

    <!-- PARTICIPANTS -->
    {#if get(event, 'participants', false) && Array.isArray(event.participants)}
      <div class="participants">
        <ParticipantsList participants={event.participants} />
      </div>
    {/if}
  </div>
  <div class="divider" />

  <!-- DATE -->
  <div class="date">{formattedDate(event.startDate)}</div>
  <div class="divider" />

  <!-- IMAGE -->
  {#if get(event, 'mainImage.asset', false)}
    <div class="image">
      <img
        src={urlFor(event.mainImage.asset)
          .width(600)
          .quality(90)
          .auto('format')
          .url()} />
    </div>
    <div class="divider" />
  {/if}

  <!-- TEXT -->
  {#if Array.isArray(get(event, 'content.content', false)) && event.content.content.length > 0}
    <div class="text">
      {@html renderBlockText(event.content.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- CONNCECTED CASE STUDIES -->
  <div class="connected-case-studies">
    <!-- {await relatedEvents then relatedEvents} -->
    <!-- {#if Array.isArray(get(event, 'connectedEvents', false))}
      <Calendar events={event.connectedEvents} related={true} />
    {/if} -->
    <!-- {/await} -->
  </div>
</div>
