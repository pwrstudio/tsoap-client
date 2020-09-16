<script>
  // # # # # # # # # # # # # #
  //
  //  Single Case Study
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { urlFor, renderBlockText } from "./sanity.js"

  // *** PROPS
  export let caseStudy = {}
</script>

<style lang="scss">
  @import "./variables.scss";

  .case-study-single {
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

<div class="case-study-single" in:fade>
  <!-- TITLE -->
  <div class="title">{caseStudy.title}</div>
  <!-- FILES -->
  {#if Array.isArray(caseStudy.files)}
    {#each caseStudy.files as f, index (f._key)}
      <div>
        <div class="title">{f.title}</div>
      </div>
    {/each}
  {/if}
  <!-- IMAGE -->
  {#if get(caseStudy, 'mainImage.asset', false)}
    <div class="image">
      <img
        src={urlFor(caseStudy.mainImage.asset)
          .width(600)
          .quality(90)
          .auto('format')
          .url()} />
    </div>
  {/if}
  <!-- TEXT -->
  {#if Array.isArray(get(caseStudy, 'content.content', false))}
    <div class="text">
      {@html renderBlockText(caseStudy.content.content)}
    </div>
  {/if}
</div>
