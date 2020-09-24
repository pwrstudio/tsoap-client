<script>
  // # # # # # # # # # # # # #
  //
  //  Single Event
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { urlFor, renderBlockText } from "./sanity.js"
  import { links } from "svelte-routing"

  // GLOBAL
  import { formattedDate } from "./global.js"
  import { isArray } from "util"

  // *** PROPS
  export let event = {}

  console.dir(event)
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

<div class="event" in:fade>
  <!-- TITLE -->
  <div class="title">{event.title}</div>
  <!-- AUTHORS -->
  {#if event.authors && Array.isArray(event.authors)}
    {#each event.authors as a (a._key)}
      <div>
        <a href={'/profiles/' + a.slug.current} class="title">{a.name}</a>
      </div>
    {/each}
  {/if}

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
