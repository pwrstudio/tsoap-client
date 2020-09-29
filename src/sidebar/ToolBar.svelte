<script>
  // # # # # # # # # # # # # #
  //
  //  Toolbar
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  // *** PROPS
  export let authenticated = false

  // VARIABLES
  let chatInputValue = ""

  const submitChat = () => {
    dispatch("submit", {
      text: chatInputValue,
    })
    chatInputValue = ""
  }

  const switchSection = (newSection) => {
    dispatch("switchSection", {
      newSection: newSection,
    })
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
    padding-right: 10px;
    background: $COLOR_DARK;
    display: flex;
    align-items: center;

    input {
      font-family: $MONO_STACK;
      font-size: $FONT_SIZE_SMALL;
      float: left;
      width: calc(100% - 70px);
      display: block;
      background: $COLOR_DARK;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_LIGHT;
      border-radius: 10px;
      padding: 10px;
      outline: none;
      height: 30px;
    }

    button {
      font-family: $MONO_STACK;
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
      height: 30px;
      line-height: 20px;

      &:hover {
        background: $COLOR_LIGHT;
        color: $COLOR_DARK;
      }
    }

    .toolbar-item {
      font-size: $FONT_SIZE_BASE;
      margin-right: 10px;
      float: left;
      color: $COLOR_LIGHT;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>

<div class="toolbar">
  {#if !authenticated}
    <input
      type="[text]"
      maxlength="600"
      bind:value={chatInputValue}
      on:keydown={(e) => {
        if (e.keyCode == 13) submitChat()
      }} />
    <button on:click={submitChat}>Send</button>
  {/if}
  {#if authenticated}
    <div
      class="toolbar-item"
      on:click={() => {
        switchSection(0)
      }}>
      Chat
    </div>
    <div
      class="toolbar-item"
      on:click={() => {
        switchSection(1)
      }}>
      Seminar
    </div>
    <div
      class="toolbar-item"
      on:click={() => {
        switchSection(2)
      }}>
      Messages
    </div>
    <div class="toolbar-item" on:click={teleport}>Support</div>
  {/if}
</div>
