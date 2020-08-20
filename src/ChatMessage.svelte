<script>
  // # # # # # # # # # # # # #
  //
  //  Chat Message
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { fade } from "svelte/transition";
  import get from "lodash/get";

  // GLOBALS
  import { formattedDate } from "./global.js";

  // PROPS
  export let message = {};
</script>

<style lang="scss">
  @import "./variables.scss";

  .chat-message {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid $lightgrey;

    .meta {
      width: 100%;
      display: inline-block;
      font-size: $font_size_small;

      .name {
        font-weight: bold;
        float: left;
      }

      .date {
        float: right;
        color: white;
      }

      .color-code {
        height: 1em;
        width: 1em;
        border-radius: 1em;
        margin-right: 0.35em;
        float: left;
      }
    }

    .body {
      font-size: $font_size_normal;
    }
  }
</style>

<div class="chat-message" transition:fade>
  <div class="meta">
    <span
      class="color-code"
      style={'background-color:' + get(message, 'tint', '0XFF0000').replace('0X', '#')} />
    <span class="name">{message.name}</span>
    <span class="date">{formattedDate(message.timestamp)}</span>
  </div>
  <div class="body">{message.text}</div>
</div>
