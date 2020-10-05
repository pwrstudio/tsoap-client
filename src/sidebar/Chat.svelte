<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // COMPONENTS
  import ChatMessage from "./ChatMessage.svelte"

  // DOM REFERENCES
  let messageContainerEl = {}

  // GLOBAL
  import { COLORMAP } from "../global.js"

  // PROPS
  export let chatMessages = []
  export let currentArea = 4

  $: {
    if (chatMessages) {
      setTimeout(() => {
        messageContainerEl.scrollTo({
          top: messageContainerEl.scrollHeight,
          left: 0,
          behavior: "smooth",
        })
      }, 100)
    }
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-container {
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

<div class="chat-container">
  <div class="header">You are in: {COLORMAP[currentArea]}</div>
  <div class="message-container" bind:this={messageContainerEl}>
    {#each chatMessages as message (message.msgId)}
      <ChatMessage {message} />
    {/each}
  </div>
</div>
