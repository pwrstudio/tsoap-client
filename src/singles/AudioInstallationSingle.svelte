<script>
  // # # # # # # # # # # # # #
  //
  //  Audio Installation Single
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { urlFor, renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"

  // COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"
  //   import CaseStudyList from "../lists/CaseStudyList.svelte"
  //   import VideoPlayer from "./VideoPlayer.svelte"

  // GLOBAL
  //   import { formattedDate, QUERY } from "../global.js"

  // *** PROPS
  export let audioInstallation = {}
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .audio-single {
    .main-header {
      padding: 15px;

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: 500;
        display: flex;
        align-items: center;

        svg {
          margin-right: 10px;
        }
      }

      .participants {
        color: $COLOR_MID_2;
        font-family: $MONO_STACK;
        font-size: $FONT_SIZE_SMALL;
        display: inline-block;
      }
    }

    .divider {
      border-bottom: 1px dotted $COLOR_MID_1;
      width: 100%;
    }

    .date {
      padding: 15px;
      text-align: center;
      font-weight: 500;
      font-family: $SANS_STACK;
    }

    .image {
      width: 100%;
      padding-top: 15px;
      padding-bottom: 15px;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
      }
    }

    .text {
      padding: 15px;
      font-family: $SANS_STACK;
      font-size: $FONT_SIZE_BASE;
      font-weight: 400;
      line-height: 1.4em;
    }

    .connected-case-studies {
      padding: 15px;
    }
  }
</style>

<div class="audio-single" in:fade use:links>
  <!-- HEADER -->
  <div class="main-header">
    <!-- TITLE -->
    <div class="title">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
      NOW: {audioInstallation.title}
    </div>

    <!-- PARTICIPANTS -->
    {#if get(audioInstallation, 'participants', false) && Array.isArray(audioInstallation.participants)}
      <div class="participants" />
    {/if}
  </div>
  <div class="divider" />
</div>
