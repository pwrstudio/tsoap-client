<script>
  // # # # # # # # # # # # # #
  //
  //  AUDIO  BLOCK
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import has from "lodash/has";
  import { urlFor, loadData, renderBlockText } from "../../sanity.js";

  // PROPS
  export let block = {};

  const audioUrl =
    "https://cdn.sanity.io/files/1tpw92x3/production/" +
    block.audioFile.asset._ref.replace("file-", "").replace("-mp3", ".mp3");

  // *** VARIABLES
  let time = 0;
  let duration = 0;
  let paused = true;
  const controlsTimeoutDuration = 2500;

  // *** DOM REFERENCES
  let audioEl;

  function handleMousemove(e) {
    if (e.which !== 1) return; // mouse not down
    if (!duration) return; // audio not loaded yet
    const { left, right } = this.getBoundingClientRect();
    time = (duration * (e.clientX - left)) / (right - left);
  }

  function handleMousedown(e) {
    function handleMouseup() {
      if (paused) audioEl.play();
      else audioEl.pause();
      cancel();
    }

    function cancel() {
      e.target.removeEventListener("mouseup", handleMouseup);
    }

    e.target.addEventListener("mouseup", handleMouseup);

    setTimeout(cancel, 200);
  }

  const format = seconds => {
    if (isNaN(seconds)) return "...";
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) seconds = "0" + seconds;
    return `${minutes}:${seconds}`;
  };
</script>

<style lang="scss">
  @import "../../variables.scss";

  .audio-container {
    width: $text_width;
    margin-left: auto;
    margin-right: auto;

    @include screen-size("small") {
      width: 100%;
    }

    .audio {
      height: $line-height * 3;
      width: 100%;
      display: block;
      color: black;
      line-height: $line-height;
      font-family: $sans-stack;
      margin-bottom: $line-height;
      margin-top: $line-height;
      user-select: none;

      cursor: pointer;

      &:active {
        cursor: grab;
      }
    }

    .top-text,
    .bottom-text {
      height: $line-height;
      font-size: $font_size_small;
      div {
        width: 50%;
        float: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: $line-height * 2;
        &.right {
          float: right;
          text-align: right;
        }
      }
    }

    progress {
      display: block;
      width: 100%;
      height: $line-height;
      z-index: 80;
      -webkit-appearance: none;
      appearance: none;

      &::-webkit-progress-value {
        background-color: #a4a4a4;
      }

      &::-webkit-progress-bar {
        background-color: #c4c4c4;
      }
    }
  }
</style>

<div class="audio-container">
  <div
    on:mousemove={handleMousemove}
    on:mousedown={handleMousedown}
    class="audio">
    <audio
      class="audio-player"
      preload="auto"
      src={audioUrl}
      bind:currentTime={time}
      bind:duration
      bind:paused
      bind:this={audioEl} />

    <div class="top-text">
      <div class="audio-title">{block.title}</div>
      <div class="audio-toggle right">{paused ? 'PLAY' : 'PAUSE'}</div>
    </div>

    <progress value={time / duration || 0} />

    <div class="bottom-text">
      <div class="current-time">{format(time)}</div>
      <div class="total-time right">{format(duration)}</div>
    </div>

  </div>
</div>
