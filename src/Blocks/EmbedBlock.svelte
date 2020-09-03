<script>
  // # # # # # # # # # # # # #
  //
  //  EMBED BLOCK
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import has from "lodash/has";
  import getVideoId from "get-video-id";
  import { urlFor, loadData, renderBlockText } from "../../sanity.js";

  // PROPS
  export let block = {};
</script>

<style lang="scss">
  @import "../../variables.scss";

  .embed {
    width: $text_width;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    font-size: $font_size_small;
    line-height: $line-height;
    font-family: $sans-stack;
    margin-bottom: $line-height;
    margin-top: $line-height;

    .youtube-container,
    .vimeo-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      max-width: 720px;
      width: 100%;
      margin-bottom: 0.5em;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    }

    .soundcloud-container {
      // height: 300px;
      width: 100%;
      overflow: hidden;
      max-width: 100%;
      margin-bottom: 0.5em;

      iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }
    }
  }
</style>

<figure class="embed">

  <!-- // YOUTUBE -->
  {#if block.url.includes('youtube')}
    <div class="youtube-container">
      <iframe
        width="720"
        height="480"
        title="paletten"
        src={'https://www.youtube.com/embed/' + getVideoId(block.url).id}
        frameborder="no"
        allow="autoplay; fullscreen"
        allowfullscreen />
    </div>
  {/if}

  <!-- // VIMEO -->
  {#if block.url.includes('vimeo')}
    <div class="vimeo-container">
      <iframe
        width="720"
        height="480"
        title="paletten"
        src={'https://player.vimeo.com/video/' + getVideoId(block.url).id}
        frameborder="no"
        scrolling="no"
        byline="false"
        color="#ffffff"
        allow="autoplay; fullscreen"
        allowfullscreen />
    </div>
  {/if}

  <!-- // SOUNDCLOUD -->
  {#if block.url.includes('soundcloud')}
    <div class="soundcloud-container">
      <iframe
        width="100%"
        height="300"
        title="paletten"
        src={'https://w.soundcloud.com/player/?url=' + block.url + '&color=%23fffff'}
        frameborder="no"
        scrolling="no"
        allow="autoplay" />
    </div>
  {/if}

  <!-- CAPTION -->
  {#if has(block, 'caption.content')}
    <figcaption class="caption">
      {@html renderBlockText(block.caption.content)}
    </figcaption>
  {/if}

</figure>
