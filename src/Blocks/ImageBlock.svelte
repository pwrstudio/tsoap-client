<script>
  // # # # # # # # # # # # # #
  //
  //  IMAGE BLOCK
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { urlFor, loadData, renderBlockText } from "../../sanity.js";
  import get from "lodash/get";
  import has from "lodash/has";

  // PROPS
  export let block = {};
</script>

<style lang="scss">
  @import "../../variables.scss";

  .image {
    width: $text_width;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    font-size: $font_size_small;
    line-height: $line-height;
    font-family: $sans-stack;
    margin-bottom: $line-height;
    // margin-top: 2rem;

    &.fullwidth {
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-height: 80vh;
      }
    }

    &.fullheight {
      width: 100%;
      max-height: unset;
      height: calc(100vh - #{$menu_bar_height});
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 0;
      padding-top: 0;
      img {
        max-height: 90vh;
      }
    }

    &.padded {
      padding-top: $line-height * 4;
      padding-bottom: $line-height * 4;
    }
  }

  .caption {
    text-align: left;
    float: left;
  }
</style>

<figure
  class="image"
  style={'background: ' + get(block, 'backgroundColor.hex', 'transparent')}
  class:padded={has(block, 'backgroundColor.hex')}
  class:fullwidth={block.fullWidth}
  class:fullheight={block.fullHeight}>

  <!-- IMAGE -->
  <img
    src={urlFor(block.asset)
      .width(800)
      .quality(90)
      .auto('format')
      .url()} />

  <!-- CAPTION -->
  <div class="text">
    {#if has(block, 'caption.content')}
      <figcaption>
        <!-- CAPTION -->
        <span class="caption>">
          {@html renderBlockText(block.caption.content)}
        </span>
      </figcaption>
    {/if}

  </div>

</figure>
