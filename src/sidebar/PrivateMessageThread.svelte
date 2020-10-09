<script>
  // # # # # # # # # # # # # #
  //
  //  Private Message Thread
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { slide } from "svelte/transition"

  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import NewPrivateMessage from "./NewPrivateMessage.svelte"
  import { authenticatedUserInformation } from "../stores"

  // PROPS
  export let message = {}
  export let own = {}

  // *** VARIABLES
  let expanded = false

  console.dir(message)
</script>

<style lang="scss">
  @import "../variables.scss";

  .message-container {
    margin-bottom: 5px;
    padding-bottom: 5px;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;
    border-bottom: 1px solid $COLOR_MID_2;

    .header {
      cursor: pointer;
      border-bottom: 1px solid transparent;
      padding-top: 10px;
      padding-bottom: 15px;

      &.expanded {
        border-bottom: 1px solid $COLOR_MID_2;
      }

      .meta {
        width: 100%;
        display: inline-block;

        .title {
          float: left;
        }

        .date {
          float: right;
          color: $COLOR_MID_2;
        }
      }

      .participants {
        color: $COLOR_MID_2;
      }
    }

    .post {
      padding-top: 10px;
      margin-bottom: 5px;

      .meta {
        width: 100%;
        display: inline-block;
        color: $COLOR_MID_2;
        padding-left: 10px;
        border-left: 1px solid $COLOR_MID_2;

        .sender {
          float: left;
        }

        .date {
          float: right;
          color: $COLOR_MID_2;
        }
      }

      .content {
        border-left: 1px solid $COLOR_MID_2;
        padding-left: 10px;
      }
    }

    .body {
    }
  }
</style>

<div class="message-container">
  <div
    class="header"
    class:expanded
    on:click={e => {
      expanded = !expanded
    }}>
    <div class="meta">
      <div class="title">{message.title}</div>
      <div class="date">{formattedDate(message.last_posted_at)}</div>
    </div>
    <div class="participants">
      {#each get(message, 'details.allowed_users', []).filter(p => p.username != get($authenticatedUserInformation, 'username', '')) as participant (participant.id)}
        <span>{participant.name}, </span>
      {/each}
    </div>
  </div>
  {#if expanded}
    <div class="thread-container" transition:slide|local>
      {#each get(message, 'post_stream.posts', []) as post (post.id)}
        <div class="post">
          <div class="meta">
            <div class="sender">{post.name}</div>
            <div class="date">{formattedDate(post.created_at)}</div>
          </div>
          <div class="content">
            {@html post.cooked}
          </div>
        </div>
      {/each}
    </div>
    <NewPrivateMessage
      url={'https://work.anthropocene-curriculum.org/t/' + message.slug + '/' + message.id}
      text="> Go to thread" />
  {/if}
</div>
