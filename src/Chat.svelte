<script>
  // # # # # # # # # # # # # #
  //
  //  Chat
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // COMPONENTS
  import ChatMessage from "./ChatMessage.svelte";

  // PROPS
  export let chatMessages = [];
  export let phoneActive = false;

  // VARIABLES
  let chatInputValue = "";

  const submitChat = () => {
    dispatch("submit", {
      text: chatInputValue
    });
    chatInputValue = "";
  };
</script>

<style lang="scss">
  @import "./variables.scss";

  .chat {
    position: fixed;
    top: 50%;
    left: 0;
    width: 400px;
    height: 50vh;
    background: #a4a4a4;
    padding: 10px;
    overflow: scroll;
    font-size: 12px;
    z-index: 100;

    @include screen-size("small") {
      top: 0;
      width: calc(100vw - 20px);
      height: 100vh;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5 ease-out;
      padding-top: 80px;

      &.phone {
        opacity: 1;
        pointer-events: all;
      }
    }
  }

  .message-container {
    width: calc(100% - 10px);
    height: calc(50vh - 40px);
    overflow-y: auto;

    @include screen-size("small") {
      height: calc(100% - 40px);
    }
  }

  .input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 400px;
    padding: 10px;
    height: 40px;

    @include screen-size("small") {
      width: calc(100% - 20px);
    }

    input {
      float: left;
      width: calc(100% - 90px);
      display: block;
      margin-bottom: 10px;
      background: $lightgrey;
      padding: 10px;
      border: 0;
      outline: none;
    }

    button {
      width: 60px;
      float: right;
      display: block;
      background: $darkgrey;
      padding: 10px;
      border: 0;
      outline: none;
      color: white;
      cursor: pointer;
      &:hover {
        background: $darkergrey;
      }
    }
  }
</style>

<div class="chat" class:phone={phoneActive}>
  <div class="message-container">
    {#each chatMessages.reverse() as message (message.msgId)}
      <ChatMessage {message} />
    {/each}
  </div>
  <div class="input-container">
    <input
      type="[text]"
      bind:value={chatInputValue}
      on:keydown={e => {
        if (e.keyCode == 13) submitChat();
      }} />
    <button on:click={submitChat}>Send</button>
  </div>
</div>
