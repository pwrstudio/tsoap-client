<script>
  // # # # # # # # # # # # # #
  //
  //  New Private Message
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { slide } from "svelte/transition"

  import { authenticatedUserInformation } from "../stores"

  // *** PROPS
  export let threadId = 0
  export let url = "https://work.anthropocene-curriculum.org/new-message"
  export let text = "+ New message"

  // *** VARIABLES
  let expanded = false
  let recipientUserName = ""
  let message = ""

  const submitPrivateMessage = () => {
    console.log("recipientUserName", recipientUserName)
    console.log("message", message)
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  .new-message {
    margin-bottom: $SPACE_XS;
    padding-bottom: $SPACE_XS;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .header {
      cursor: pointer;
      border: 1px solid $COLOR_MID_2;
      padding: $SPACE_XS;
      padding-right: $SPACE_S;
      padding-left: $SPACE_S;
      border-radius: 5px;
      width: auto;
      display: inline-block;
      color: $COLOR_LIGHT;
      text-decoration: none;

      &:hover {
        border: 1px solid $COLOR_LIGHT;
      }
    }

    .inner {
      padding-bottom: $SPACE_S;
      margin-top: $SPACE_S;
      border-bottom: 1px solid $COLOR_MID_2;

      .row {
        display: inline-block;
        width: 100%;
        margin-bottom: $SPACE_XS;
      }

      .label {
        float: left;
        line-height: 30px;
        width: 30px;
      }

      input {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        float: left;
        width: 100%;
        background: $COLOR_DARK;
        border: 1px solid $COLOR_MID_2;
        color: $COLOR_LIGHT;
        border-radius: 10px;
        padding: $SPACE_S;
        outline: none;
        height: 30px;
        margin-right: $SPACE_S;

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

      textarea {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_BASE;
        float: left;
        width: 100%;
        display: block;
        background: $COLOR_DARK;
        border: 1px solid $COLOR_MID_2;
        color: $COLOR_LIGHT;
        border-radius: 10px;
        padding: $SPACE_S;
        outline: none;
        resize: none;
        height: 6em;

        &:focus {
          border: 1px solid $COLOR_LIGHT;
        }
      }

      button {
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_BASE;
        width: 60px;
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
          border: 1px solid $COLOR_LIGHT;
        }

        &.close-chat {
          width: 40px;
          margin-left: $SPACE_S;
        }
      }
    }
  }
</style>

<div class="new-message">
  <a href={url} target="_blank" class="header">{text}</a>
  <!-- <div
  class="header"
  on:click={e => {
    expanded = !expanded
  }}>
  + New message
</div> -->
  <!-- {#if expanded}
    <div class="inner" transition:slide|local>
      <div class="row">
        <input
          type="[text]"
          maxlength="200"
          placeholder="Recipient"
          class="recipient"
          bind:value={recipientUserName} />
      </div>
      <div class="row"><textarea class="message" bind:value={message} /></div>
      <div class="row">
        <button on:click={submitPrivateMessage}>Send</button>
      </div>
    </div>
  {/if} -->
</div>
