<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // COMPONENTS
  import { onMount } from "svelte"
  import ChatMessage from "./ChatMessage.svelte"

  // DOM REFERENCES
  let messageContainerEl = {}

  // GLOBAL
  import { COLORMAP } from "../global.js"

  // PROPS
  export let chatMessages = []
  export let currentRoom = 2
  export let mobile = false
  export let mobileExpanded = false

  onMount(async () => {
    if (messageContainerEl) {
      messageContainerEl.scrollTo({
        top: messageContainerEl.scrollHeight,
        left: 0,
      })
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-container {
    position: relative;
    height: 100%;
    @include screen-size("small") {
      height: calc(100% - 40px);
    }
  }

  .header {
    font-size: $FONT_SIZE_SMALL;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 7px;
    padding-bottom: 7px;
    width: 100%;
    color: $COLOR_LIGHT;
    border-bottom: 1px solid $COLOR_LIGHT;
    text-align: left;
  }

  .message-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    // padding-bottom: 10px;
    padding-top: 10px;
    @include hide-scroll;

    @include screen-size("small") {
      height: 100%;
      padding-bottom: 0;
      padding-top: 0;
      &.expanded {
        padding-bottom: 10px;
        padding-top: 10px;
        height: calc(100% - 20px);
      }
    }
  }
</style>

<div class="chat-container">
  {#if mobile && mobileExpanded}
    <div class="header">You are in: {currentRoom}</div>
  {/if}
  <div
    class="message-container"
    class:expanded={mobileExpanded}
    bind:this={messageContainerEl}>
    {#each chatMessages as message (message.msgId)}
      <ChatMessage {message} />
    {/each}
  </div>
</div>
