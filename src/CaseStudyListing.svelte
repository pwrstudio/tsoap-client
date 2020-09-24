<script>
  // # # # # # # # # # # # # #
  //
  //  Listing Case Study
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { urlFor, renderBlockText } from "./sanity.js"

  // *** PROPS
  export let caseStudies = []
</script>

<style lang="scss">
  @import "./variables.scss";

  .case-study-listing {
    padding: 10px;

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

    .item {
      width: 100px;
      height: 150px;
      padding: 5px;
      background: $COLOR_LIGHT;
      margin: 10px;
      float: left;
      cursor: pointer;
      text-decoration: none;
      display: block;

      img,
      video {
        max-width: 100%;
        width: 100%;
        height: auto;
        object-fit: cover;
      }

      &:hover {
        background: $COLOR_MID_2;
      }
    }
  }
</style>

<div class="case-study-listing">
  <!-- TITLE -->
  <div class="title">Case studies</div>

  {#each caseStudies as cs, index (cs._id)}
    <a href={'/case-studies/' + get(cs, 'slug.current', '')} class="item">
      <div class="title">{cs.title}</div>
      {#if get(cs, 'mainImage.asset', false)}
        <img
          src={urlFor(cs.mainImage.asset)
            .width(100)
            .height(100)
            .quality(100)
            .auto('format')
            .url()} />
      {/if}
    </a>
  {/each}
</div>
