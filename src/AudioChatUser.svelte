<script>
  // # # # # # # # # # # # # #
  //
  //  AUDIO CHAT USER
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // *** PROPS
  export let user = {}

  // *** STORES
  import { globalUserList } from "./stores"

  console.dir(user)
  console.dir($globalUserList)
  const userIndex = $globalUserList.findIndex(u => u.name == user.display)
  console.log("userIndex =>", userIndex)
</script>

<style lang="scss">
  @import "./variables.scss";

  .user {
    margin-bottom: $SPACE_S;
    font-size: $FONT_SIZE_SMALL;
    width: 100%;
    line-height: 3em;
    height: 3em;

    .icon {
      float: left;
      height: 3em;
      width: 3em;
      border-radius: 3em;
      margin-right: 1em;
      background: $COLOR_MID_1;
      border: 3px solid transparent;
      transition: border 0.3s ease-out;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
      }
    }

    &.talking {
      .icon {
        border: 3px solid rgb(113, 238, 113);
      }
    }

    .name {
      float: left;
    }

    .speaking {
      float: right;
      display: flex;
      align-items: center;
      height: 3em;
      padding-right: $SPACE_M;

      svg {
        opacity: 0.5;
      }
    }
  }
</style>

<div class="user {user.id}" class:talking={user.talking} transition:fade>
  <div class="icon">
    {#if userIndex > -1}
      <img src={get($globalUserList[userIndex], 'avatarLink.iconUrl', '')} />
    {/if}
  </div>
  <div class="name">
    {user.display}
    {#if userIndex > -1}
      <a
        href={'https://work.anthropocene-curriculum.org/new-message?username=' + get($globalUserList[userIndex], 'username', '')}
        target="_blanks">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="13"
          viewBox="0 0 24 24"
          width="13">
          <path
            d="M4 4h16v12H5.17L4 17.17V4m0-2c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4zm2 10h12v2H6v-2zm0-3h12v2H6V9zm0-3h12v2H6V6z" />
        </svg>
      </a>
    {/if}
  </div>
</div>
