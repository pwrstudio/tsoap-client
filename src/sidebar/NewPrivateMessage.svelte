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
    margin-bottom: 5px;
    padding-bottom: 5px;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .header {
      cursor: pointer;
      border: 1px solid $COLOR_MID_2;
      padding: 5px;
      padding-right: 10px;
      padding-left: 10px;
      border-radius: 5px;
      width: auto;
      display: inline-block;

      a {
        color: $COLOR_MID_2;
      }

      &:hover {
        border: 1px solid $COLOR_LIGHT;
        a {
          color: $COLOR_LIGHT;
        }
      }
    }

    .inner {
      padding-bottom: 10px;
      margin-top: 10px;
      border-bottom: 1px solid $COLOR_MID_2;

      .row {
        display: inline-block;
        width: 100%;
        margin-bottom: 5px;
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
        padding: 10px;
        outline: none;
        height: 30px;
        margin-right: 10px;

        &:focus {
          border: 1px solid $COLOR_LIGHT;
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
        padding: 10px;
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
          margin-left: 10px;
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
