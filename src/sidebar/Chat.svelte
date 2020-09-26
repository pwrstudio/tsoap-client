<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { slide } from "svelte/transition"
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  // COMPONENTS
  import ChatMessage from "./ChatMessage.svelte"

  // DOM REFERENCES
  let messageContainerEl = {}

  // GLOBAL
  import { COLORMAP } from "../global.js"

  // PROPS
  export let chatMessages = []
  export let currentArea = 4
  export let roomName = ""

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
    height: calc(100% - 60px);
    overflow-y: auto;
    padding-bottom: 20px;
    padding-top: 10px;
  }

  .input-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-top: 0px;
    padding-bottom: 10px;
    height: 50px;
    padding-left: 7px;
    padding-right: 10px;

    input {
      font-family: $mono-stack;
      font-size: $FONT_SIZE_SMALL;
      float: left;
      width: calc(100% - 70px);
      display: block;
      margin-bottom: 10px;
      background: $COLOR_DARK;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_LIGHT;
      border-radius: 10px;
      padding: 10px;
      outline: none;
      height: 40px;
    }

    button {
      font-family: $mono-stack;
      font-size: $FONT_SIZE_SMALL;
      width: 60px;
      float: right;
      display: block;
      background: $COLOR_DARK;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_LIGHT;
      border-radius: 5px;
      outline: none;
      cursor: pointer;
      height: 40px;
      line-height: 34px;

      &:hover {
        background: $COLOR_LIGHT;
        color: $COLOR_DARK;
      }
    }
  }
</style>

<div class="chat-container">
  <div class="header">You are in: {COLORMAP[currentArea]}</div>
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
