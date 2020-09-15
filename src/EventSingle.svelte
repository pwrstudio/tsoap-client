<script>
  // # # # # # # # # # # # # #
  //
  //  Single Event
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { urlFor, renderBlockText } from "./sanity.js"

  // GLOBAL
  import { formattedDate } from "./global.js"

  // *** PROPS
  export let event = {}
</script>

<style lang="scss">
  @import "./variables.scss";

  .event {
    .title {
      font-weight: bold;
    }

    .image {
      width: 300px;
      img,
      video {
        width: 100%;
        height: auto;
        object-fit: cover;
      }
    }
  }
</style>

<div class="event">
  <!-- TITLE -->
  <div class="title">{event.title}</div>

  <!-- DATE -->
  <div class="date">{formattedDate(event.startDate)}</div>

  <!-- IMAGE -->
  <div class="image">
    {#if get(event, 'mainImage.asset', false)}
      <img
        src={urlFor(event.mainImage.asset)
          .width(600)
          .quality(90)
          .auto('format')
          .url()} />
    {/if}
  </div>

  <!-- TEXT -->
  <div>
    {#if get(event, 'content.content', false)}
      {@html renderBlockText(event.content.content)}
    {/if}
  </div>
</div>
