<script>
  // # # # # # # # # # # # # #
  //
  //  Single Audio Installation
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { onDestroy } from "svelte"
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"
  import { Howler } from "howler"

  // COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"
  import CaseStudyList from "../lists/CaseStudyList.svelte"

  // GLOBAL
  import { QUERY } from "../global.js"

  // *** PROPS
  export let audioInstallation = {}

  // *** VARIABLES
  let expanded = false
  let playing = true
  let connectedCaseStudies = []

  if (audioInstallation._id) {
    connectedCaseStudies = loadData(QUERY.CONNECTED_CASE_STUDIES, {
      id: audioInstallation._id,
    })
  }

  connectedCaseStudies.then(connectedCaseStudies => {
    console.dir(connectedCaseStudies)
  })

  onDestroy(async () => {
    Howler.volume(1)
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .audio-single {
    .main-header {
      padding: 15px;
      position: relative;
      user-select: none;
      display: flex;

      .controls {
        margin-right: 10px;
        cursor: pointer;
      }

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: 500;
      }

      .expand {
        position: absolute;
        top: 10px;
        right: 10px;
        color: $COLOR_MID_2;
        opacity: 0.4;
        cursor: pointer;
        // svg {
        //   color: $COLOR_MID_2;
        //   path {
        //     stroke: $COLOR_MID_2;
        //   }
        // }

        &:hover {
          opacity: 1;
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
  {#if audioInstallation.title}
    <!-- HEADER -->
    <div class="main-header">
      <!-- CONTROLS -->
    <div class='controls' on:click={e => {
      playing = !playing
      Howler.volume(playing ? 1 : 0);
    }}>
      {#if playing}
        <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
      {:else}
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>
      {/if}
    </div>

    <div class='mid-section'>
      <!-- TITLE -->
      <div class="title">NOW: { audioInstallation.title}</div>
      <!-- PARTICIPANTS -->
      {#if get(audioInstallation, 'participants', false) && Array.isArray(audioInstallation.participants)}
        <div class="participants">
          <ParticipantsList participants={audioInstallation.participants} />
        </div>
      {/if}
    </div>

    <!-- ARROW DOWN -->
    <div class='expand' on:click={() => {
      expanded = !expanded}}>
      {#if expanded}
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      {/if}
    </div>
  </div>

    <div class="divider" />

    {#if expanded}
      <!-- TEXT -->
      {#if Array.isArray(get(audioInstallation, 'content.content', false)) && audioInstallation.content.content.length > 0}
      <div class="text">
        {@html renderBlockText(audioInstallation.content.content)}
      </div>
      <div class="divider" />
    {/if}

      <!-- CONNECTED CASE STUDIES -->
      <div class="connected-case-studies">
      {#await connectedCaseStudies then connectedCaseStudies}
        <CaseStudyList caseStudies={connectedCaseStudies} related={true} />
      {/await}
    </div>
    {/if}
  {/if}
</div>
