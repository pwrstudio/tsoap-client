<script>
  // # # # # # # # # # # # # #
  //
  //  Chat Message
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // GLOBALS
  import { formattedChatDate } from "./global.js"

  // PROPS
  export let message = {}
</script>

<style lang="scss">
  @import "./variables.scss";

  .chat-message {
    margin-bottom: 5px;
    padding-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: $COLOR_LIGHT;

    .meta {
      width: 100%;
      display: inline-block;
      font-size: $FONT_SIZE_SMALL;

      .name {
        float: left;
      }

      .date {
        float: right;
      }

      .color-code {
        height: 0.5em;
        width: 0.5em;
        border-radius: 0.5em;
        margin-right: 1em;
        float: left;
        background: $COLOR_LIGHT;
        position: relative;
        top: 4px;
      }
    }

    .body {
      font-size: $FONT_SIZE_BASE;
    }
  }
</style>

<div class="chat-message" transition:fade|local>
  <div class="meta">
    <span class="color-code" />
    <span class="name">{message.name}</span>
    <span class="date">{formattedChatDate(message.timestamp)}</span>
  </div>
  <div class="body">{message.text}</div>
</div>

<!-- style={'background-color:' + get(message, 'tint', '0xF0F0F0').replace('0x', '#')} /> -->
