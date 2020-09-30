<script>
  // # # # # # # # # # # # # #
  //
  //  Messaging
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { slide } from "svelte/transition"

  // COMPONENTS
  //   import ChatMessage from "./ChatMessage.svelte"

  // DOM REFERENCES
  //   let messageContainerEl = {}

  // GLOBAL
  import { COLORMAP } from "../global.js"

  // PROPS
  export let chatMessages = []
  export let currentArea = 4
</script>

<style lang="scss">
  @import "../variables.scss";

  .messaging-container {
    position: relative;
    height: 100%;
  }

  .header {
    font-size: $FONT_SIZE_SMALL;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 7px;
    padding-bottom: 7px;
    width: 100%;
    background: $COLOR_DARK;
    color: $COLOR_LIGHT;
    border-bottom: 1px solid $COLOR_LIGHT;
    text-align: left;
  }

  .message-container {
    width: 100%;
    height: calc(100% - 30px);
    overflow-y: auto;
    padding-bottom: 10px;
    padding-top: 10px;
  }
</style>

<div class="messaging-container">
  <div class="header">Messaging</div>
  <div class="message-container">
    <div>TODO: List all messages<br /> TODO: Allow writing message</div>
    <div>
      TODO: if slug: List all messages from specific user<br />
      TODO: Allow writing message to specified user
    </div>
    <!-- {#each chatMessages as message (message.msgId)}
      <ChatMessage {message} />
    {/each} -->
  </div>
</div>
