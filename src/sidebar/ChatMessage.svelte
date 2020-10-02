<script>
  // # # # # # # # # # # # # #
  //
  //  Chat Message
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { fade } from "svelte/transition"
  import anchorme from "anchorme"

  // GLOBALS
  import { formattedChatDate } from "../global.js"

  // PROPS
  export let message = {}
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-message {
    margin-bottom: 5px;
    padding-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .meta {
      width: 100%;
      display: inline-block;
      color: $COLOR_MID_2;

      .name {
        float: left;
      }

      .date {
        float: right;
      }
    }

    .body {
      border-left: 1px solid $COLOR_MID_2;
      padding-left: 10px;
    }
  }
</style>

<div class="chat-message" transition:fade|local>
  <div class="meta">
    <span class="name">{message.name}:</span>
    <span class="date">{formattedChatDate(message.timestamp)}</span>
  </div>
  <div class="body">
    {@html anchorme({
      input: message.text,
      options: {
        attributes: {
          target: '_blank',
        },
      },
    })}
  </div>
</div>
