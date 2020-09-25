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
    display: inline-block;

    .header {
      margin-bottom: 10px;
      font-weight: bold;
      margin-bottom: 20px;
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
      width: 140px;
      background: $COLOR_LIGHT;
      margin-right: 10px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      color: $COLOR_DARK;

      .title {
        margin-bottom: 10px;
      }

      img,
      video {
        max-width: 100%;
        width: 100%;
        height: auto;
        object-fit: cover;
      }

      &:hover {
        text-decoration: underline;
        img {
          opacity: 0.8;
        }
      }
    }
  }
</style>

<div class="case-study-listing">
  <!-- TITLE -->
  <div class="header">Case studies</div>

  {#each caseStudies as cs, index (cs._id)}
    <a href={'/case-studies/' + get(cs, 'slug.current', '')} class="item">
      <div class="title">{cs.title}</div>
      {#if get(cs, 'mainImage.asset', false)}
        <img
          src={urlFor(cs.mainImage.asset)
            .width(140)
            .height(100)
            .quality(100)
            .auto('format')
            .url()} />
      {/if}
    </a>
  {/each}
</div>
