<script>
  // # # # # # # # # # # # # #
  //
  //  Chat Message
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { fade } from "svelte/transition"
  import anchorme from "anchorme"

  // GLOBALS
  import { formattedChatDate } from "../global.js"

  // PROPS
  export let message = {}

  // *** STORES
  import { localUserAuthenticated } from "../stores"

  console.log("____ message")
  console.dir(message)
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-message {
    margin-bottom: 5px;
    padding-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .meta {
      width: 100%;
      display: inline-block;
      color: $COLOR_MID_2;

      .name {
        float: left;
      }

      .date {
        float: right;
      }
    }

    .body {
      border-left: 1px solid $COLOR_MID_2;
      padding-left: 10px;
      padding-right: 5px;
    }
  }
</style>

<div class="chat-message" transition:fade|local>
  <div class="meta">
    {#if $localUserAuthenticated && message.authenticated && message.username}
      <span class="name">
        {message.name}
        <a
          href={'https://work.anthropocene-curriculum.org/new-message?username=' + message.username}
          target="_blanks">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="18"
            viewBox="0 0 24 24"
            width="18">
            <path
              d="M4 4h16v12H5.17L4 17.17V4m0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4zm2 10h12v2H6v-2zm0-3h12v2H6V9zm0-3h12v2H6V6z" />
          </svg>
        </a>
      </span>
    {:else}<span class="name">{message.name}</span>{/if}
    <span class="date">{formattedChatDate(message.timestamp)}</span>
  </div>
  <div class="body">
    {@html anchorme({
      input: message.text,
      options: {
        attributes: {
          target: '_blank',
        },
      },
    })}
  </div>
</div>
