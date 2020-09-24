<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  // COMPONENTS
  import ChatMessage from "./ChatMessage.svelte"

  // DOM REFERENCES
  let messageContainerEl = {}

  // GLOBAL
  import { COLORMAP } from "./global.js"

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

  // VARIABLES
  let chatInputValue = ""

  const submitChat = () => {
    dispatch("submit", {
      text: chatInputValue,
    })
    chatInputValue = ""
  }
</script>

<style lang="scss">
  @import "./variables.scss";

  .chat-container {
    position: relative;
    height: 100%;
  }

  .header {
    font-size: $FONT_SIZE_SMALL;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
    background: $COLOR_DARK;
    color: $COLOR_LIGHT;
    text-align: center;
  }

  .message-container {
    width: calc(100% - 10px);
    width: 100%;
    height: calc(100% - 50px);
    overflow-y: auto;

    @include screen-size("small") {
      height: calc(100% - 40px);
    }
  }

  .input-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-top: 10px;
    height: 40px;

    @include screen-size("small") {
      width: calc(100% - 20px);
    }

    input {
      float: left;
      width: calc(100% - 90px);
      display: block;
      margin-bottom: 10px;
      background: $COLOR_MID_2;
      padding: 10px;
      border: 0;
      outline: none;
    }

    button {
      width: 60px;
      float: right;
      display: block;
      background: $COLOR_MID_3;
      padding: 10px;
      border: 0;
      outline: none;
      color: white;
      cursor: pointer;
      &:hover {
        background: $COLOR_MID_2;
      }
    }
  }
</style>

<div class="chat-container">
  <div class="header">Current room: {COLORMAP[currentArea]}</div>
  <div class="message-container" bind:this={messageContainerEl}>
    {#each chatMessages as message (message.msgId)}
      <ChatMessage {message} />
    {/each}
  </div>
  <div class="input-container">
    <input
      type="[text]"
      maxlength="600"
      bind:value={chatInputValue}
      on:keydown={(e) => {
        if (e.keyCode == 13) submitChat()
      }} />
    <button on:click={submitChat}>Send</button>
  </div>
</div>
