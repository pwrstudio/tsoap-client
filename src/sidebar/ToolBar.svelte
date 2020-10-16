<script>
  // # # # # # # # # # # # # #
  //
  //  Toolbar
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { links, navigate } from "svelte-routing"
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  // *** STORES
  import { localUserAuthenticated } from "../stores"

  // *** PROPS
  export let section = ""

  // VARIABLES
  let chatInputValue = ""
  let showChatInput = false

  const submitChat = () => {
    dispatch("submit", {
      text: chatInputValue,
    })
    chatInputValue = ""
  }

  const teleport = () => {
    dispatch("teleport")
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  .toolbar {
    width: 100%;
    height: 100%;
    padding-left: 7px;
    padding-right: $SPACE_S;
    // background: $COLOR_DARK;
    display: flex;
    align-items: center;
    user-select: none;

    input {
      font-family: $MONO_STACK;
      font-size: $FONT_SIZE_BASE;
      float: left;
      width: calc(100% - 60px);
      display: block;
      background: transparent;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_LIGHT;
      border-radius: 10px;
      padding: $SPACE_S;
      outline: none;
      height: 30px;
      margin-right: $SPACE_S;

      &.smaller {
        width: calc(100% - 110px);
      }

      &:focus {
        border: 1px solid $COLOR_LIGHT;
      }

      input[type="text"] {
        -webkit-appearance: none;
      }

      select {
        -webkit-appearance: none;
      }
    }

    button {
      font-family: $MONO_STACK;
      font-size: $FONT_SIZE_BASE;
      width: 60px;
      float: right;
      display: block;
      background: transparent;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_LIGHT;
      border-radius: 5px;
      outline: none;
      cursor: pointer;
      height: 30px;
      line-height: 20px;

      &:hover {
        border: 1px solid $COLOR_LIGHT;
      }

      &.close-chat {
        width: 40px;
        margin-left: $SPACE_S;
      }
    }

    .toolbar-item {
      font-size: $FONT_SIZE_BASE;
      margin-right: $SPACE_S;
      float: left;
      color: $COLOR_LIGHT;
      cursor: pointer;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }

      &.active {
        text-decoration: underline;
      }

      &.chat {
        border: 1px solid $COLOR_MID_2;
        border-radius: 10px;
        padding: 7px;
        text-decoration: none;
        padding-right: $SPACE_L;
        padding-left: $SPACE_L;

        &:hover {
          border: 1px solid $COLOR_LIGHT;
        }
      }
    }
  }
</style>

<div class="toolbar" use:links>
  {#if $localUserAuthenticated && !showChatInput}
    <!-- CHAT => open full input -->
    <div
      class="toolbar-item chat"
      on:click={(e) => {
        showChatInput = true
        navigate('/')
      }}>
      Chat
    </div>
    <!-- SEMINAR -->
    <a
      href="/seminar"
      class="toolbar-item"
      class:active={section === 'seminar'}>
      Seminar</a>
    <!-- MESSAGES -->
    <a
      href="/messages"
      class="toolbar-item"
      class:active={section === 'messages'}>Messages</a>
    <div class="toolbar-item" on:click={teleport}>Support</div>
  {:else}
    <!-- CHAT -->
    <input
      placeholder="Write a message..."
      type="[text]"
      maxlength="600"
      bind:value={chatInputValue}
      class:smaller={$localUserAuthenticated}
      on:keydown={(e) => {
        if (e.keyCode == 13) submitChat()
      }} />
    <button on:click={submitChat}>Send</button>
    {#if $localUserAuthenticated}
      <button
        class="close-chat"
        on:click={e => {
          showChatInput = false
        }}>×</button>
    {/if}
  {/if}
</div>
