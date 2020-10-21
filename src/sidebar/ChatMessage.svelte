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
  import { localUserAuthenticated, authenticatedUserInformation } from "../stores"

  console.log('message')
  console.log('$authenticatedUserInformation', $authenticatedUserInformation)
</script>

<style lang="scss">
  @import "../variables.scss";

  .chat-message {
    margin-bottom: $SPACE_XS;
    padding-bottom: $SPACE_XS;
    padding-left: $SPACE_S;
    padding-right: $SPACE_S;
    color: $COLOR_LIGHT;
    font-size: $FONT_SIZE_SMALL;
    user-select: none;

    .meta {
      width: 100%;
      display: inline-block;
      color: $COLOR_MID_2;

      .name {
        float: left;
        svg {
          path {
            fill: $COLOR_MID_2;
          }
          &:hover {
            path {
              fill: $COLOR_LIGHT;
            }
          }
        }
      }

      .date {
        float: right;
      }
    }

    .body {
      border-left: 1px solid $COLOR_MID_2;
      padding-left: $SPACE_S;
      padding-right: $SPACE_XS;
    }

    &.broadcast {
      .body {
        color: yellow;
      }
    }

    &.narrowcast {
      .body {
        color: green;
      }
    }
  }
</style>

{#if !message.directed || ($localUserAuthenticated && message.directed && message.directedTo === 'all') || ($localUserAuthenticated && message.directed && message.directedTo === $authenticatedUserInformation.username)}
  <div class="chat-message" class:broadcast={message.directed && message.directedTo === 'all'} class:narrowcast={message.directed && message.directedTo !== 'all'} transition:fade|local>
    <div class="meta">
      {#if $localUserAuthenticated && message.authenticated}
        <span class="name">
          {message.name}
          <a
            href={'https://work.anthropocene-curriculum.org/new-message?username=' + message.username}
            target="_blanks">
            <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4576 0.300293H1.37064C1.17551 0.300293 1.00664 0.371591 0.864044 0.514191C0.721445 0.65679 0.650146 0.825654 0.650146 1.02079V2.23663L6.41412 4.53321L12.1781 2.23663V1.02079C12.1781 0.825654 12.1068 0.65679 11.9642 0.514191C11.8216 0.371591 11.6527 0.300293 11.4576 0.300293ZM0.650146 3.40744V8.22576C0.650146 8.42089 0.721445 8.58976 0.864044 8.73236C1.00664 8.87496 1.17551 8.94626 1.37064 8.94626H11.4576C11.6527 8.94626 11.8216 8.87496 11.9642 8.73236C12.1068 8.58976 12.1781 8.42089 12.1781 8.22576V3.40744L6.41412 5.70402L0.650146 3.40744Z"/>
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
{/if}
