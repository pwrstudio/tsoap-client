<script>
  // # # # # # # # # # # # # #
  //
  //  Messaging
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get";

  // COMPONENTS
  import PrivateMessageThread from "./PrivateMessageThread.svelte";

  // *** STORES
  import {
    localUserAuthenticated,
    authenticatedUserInformation,
  } from "../stores";

  // *** VARIABLES
  let privateMessages = [];

  if (
    $localUserAuthenticated &&
    get($authenticatedUserInformation, "username", false)
  ) {
    let username = $authenticatedUserInformation.username;
    // console.log(username)
    fetch("https://sso.tsoap.dev/messages?user=" + username)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        privateMessages = data.messages;
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  .messaging-container {
    position: relative;
    height: 100%;
    font-size: $FONT_SIZE_SMALL;

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
      height: calc(100% - 30px);
      overflow-y: auto;
      padding-bottom: 10px;
      padding-top: 10px;
      padding-left: 10px;
      padding-right: 10px;
      color: $COLOR_MID_2;

      @include hide-scroll;
    }
  }
</style>

<div class="messaging-container">
  <div class="header">Messaging</div>
  <div class="message-container">
    {#each privateMessages as message (message.id)}
      <PrivateMessageThread {message} />
    {/each}
    <div>TODO: Allow writing message</div>
    <!-- <div>
      TODO: if slug:<br />
      TODO: List all messages from specific user<br />
      TODO: Allow writing message to specified user
    </div> -->
  </div>
</div>
