<script>
  // # # # # # # # # # # # # #
  //
  //  VIDEO BLOCK
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { onMount } from "svelte";
  import has from "lodash/has";
  import get from "lodash/get";
  import { urlFor, loadData, renderBlockText } from "../../sanity.js";

  // PROPS
  export let block = {};

  console.dir(block);

  const videoUrl =
    "https://cdn.sanity.io/files/1tpw92x3/production/" +
    block.videoFile.asset._ref.replace("file-", "").replace("-mp4", ".mp4");

  // *** DOM REFERENCES
  let videoEl = {};

  // *** VARIABLES
  let time = 0;
  let duration = 0;
  let paused = true;
  let showControls = true;
  let showControlsTimeout;
  let controlsTimeoutDuration = 1500;

  // --- Video controls
  function handleMousemove(e) {
    // Make the controls visible, but fade out after
    // 1.5 seconds of inactivity
    clearTimeout(showControlsTimeout);
    showControlsTimeout = setTimeout(
      () => (showControls = false),
      controlsTimeoutDuration
    );
    showControls = true;

    if (e.which !== 1) return; // mouse not down
    if (!duration) return; // video not loaded yet

    const { left, right } = this.getBoundingClientRect();
    time = (duration * (e.clientX - left)) / (right - left);
  }

  function handleMousedown(e) {
    function handleMouseup() {
      if (paused) {
        e.target.play();
      } else {
        e.target.pause();
      }
      cancel();
    }

    function cancel() {
      e.target.removeEventListener("mouseup", handleMouseup);
    }

    e.target.addEventListener("mouseup", handleMouseup);

    setTimeout(cancel, 200);
  }

  function format(seconds) {
    if (isNaN(seconds)) return "...";

    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = "0" + seconds;

    return `${minutes}:${seconds}`;
  }

  // *** ON MOUNT
  onMount(async () => {
    if (block.autoPlay) {
      let promise = videoEl.play();
      if (promise !== undefined) {
        promise.catch(err => {
          Sentry.captureException(err);
        });
      }
    }
  });
</script>

<style lang="scss">
  @import "../../variables.scss";

  .video {
    width: $text_width;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    font-size: $font_size_small;
    line-height: $line-height;
    font-family: $sans-stack;
    margin-bottom: $line-height;
    margin-top: $line-height;
    color: $white;

    position: relative;
    display: flex;
    justify-content: center;

    cursor: pointer;

    &--playing {
      cursor: grab;
    }

    .controls {
      transition: opacity 1s;
    }

    .buttons {
      position: absolute;
      position: absolute;
      top: 50%;
      left: 50%;

      width: 160px;
      height: 160px;

      @include screen-size("small") {
        width: 80px;
        height: 80px;
      }

      transform: translateX(-50%) translateY(-50%);
      pointer-events: none;

      color: white;

      svg {
        width: 100%;
      }
    }

    .play {
      position: relative;
      left: 4px;
    }

    .time {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }

    progress {
      position: absolute;
      bottom: 0px;
      left: -2px;
      display: block;
      width: 100%;
      height: 7px;
      -webkit-appearance: none;
      appearance: none;

      pointer-events: none;

      &::-webkit-progress-value {
        background-color: rgba(255, 255, 255, 1);
      }

      &::-webkit-progress-bar {
        background-color: rgba(0, 0, 0, 1);
      }
    }

    &.fullwidth {
      margin-left: 0;
      margin-right: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        max-height: 80vh;
      }

      .video-player {
        width: 960px;
        max-width: 96%;
      }

      &.padded {
        padding-top: $line-height * 4;
        padding-bottom: $line-height * 4;
      }
    }
  }
</style>

<figure
  class="video"
  class:fullwidth={block.fullWidth}
  class:padded={has(block, 'backgroundColor.hex')}
  style={'background: ' + get(block, 'backgroundColor.hex', 'transparent')}>

  <video
    class="video-player"
    preload="metadata"
    loop={true}
    muted={block.autoPlay}
    src={videoUrl}
    on:mousemove={handleMousemove}
    on:mousedown={handleMousedown}
    bind:currentTime={time}
    bind:duration
    bind:paused
    bind:this={videoEl} />

  {#if !block.autoPlay}
    <div class="controls" style="opacity: {duration && showControls ? 1 : 0}">

      <!-- <progress value={time / duration || 0} /> -->

      <div class="buttons">
        {#if paused}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="0.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-play play">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="0.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-pause pause">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        {/if}
      </div>

    </div>
  {/if}

</figure>
