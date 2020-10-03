<script>
  // # # # # # # # # # # # # #
  //
  //  EMBED BLOCK
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import getVideoId from "get-video-id"

  // PROPS
  export let streamUrl = ""
</script>

<style lang="scss">
  @import "../../variables.scss";

  .embed {
    width: 100%;
    background: black;
    // margin-left: auto;
    // margin-right: auto;
    // background: black;
    display: flex;
    justify-content: center;
    align-items: center;
    // position: fixed;
    // top: 0;
    // left: 0;
    // margin: 0;
    // padding: 0;
    // pointer-events: none;

    .youtube-container,
    .vimeo-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      // max-width: 90%;
      width: 720px;

      iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    }
  }
</style>

<div class="embed">
  <!-- // YOUTUBE -->
  {#if streamUrl.includes('youtube')}
    <div class="youtube-container">
      <iframe
        width="720"
        height="480"
        src={'https://www.youtube.com/embed/' + getVideoId(streamUrl).id}
        frameborder="no"
        allow="autoplay; fullscreen"
        allowfullscreen />
    </div>
  {/if}

  <!-- // VIMEO -->
  {#if streamUrl.includes('vimeo')}
    <div class="vimeo-container">
      <iframe
        width="720"
        height="480"
        src={'https://player.vimeo.com/video/' + getVideoId(streamUrl).id + '?autoplay=1'}
        frameborder="no"
        scrolling="no"
        byline="false"
        color="#ffffff"
        allow="autoplay; fullscreen"
        allowfullscreen />
    </div>
  {/if}
</div>
