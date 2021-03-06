<script>
  // # # # # # # # # # # # # #
  //
  //  Single Event
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText, loadData } from "../../sanity.js"
  import { links } from "svelte-routing"

  // *** COMPONENTS
  import ParticipantsList from "../../lists/ParticipantsList.svelte"
  import CaseStudyList from "../../lists/CaseStudyList.svelte"
  import VideoPlayer from "./VideoPlayer.svelte"

  // *** GLOBAL
  import { QUERY } from "../../global.js"

  // *** PROPS
  export let event = {}
  export let url = ''

  let expanded = false
  let showVideo = true
  let connectedCaseStudies = []

  if (event._id) {
    connectedCaseStudies = loadData(QUERY.CONNECTED_CASE_STUDIES, {
      id: event._id,
    }).catch(err => {
      console.dir(err)
    })
  }
</script>

<style lang="scss">
  @import "../../variables.scss";

  .event-single {
    .main-header {
      padding: $SPACE_M;
      position: relative;
      user-select: none;

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: 500;
        max-width: calc(100% - 40px);
      }

      .expand {
        position: absolute;
        top: 8px;
        right: 40px;
        color: $COLOR_MID_2;
        opacity: 0.4;
        cursor: pointer;
        transition: opacity 0.3s $transition;

        &:hover {
          opacity: 0.7;
        }
      }

      .toggleVideo {
        position: absolute;
        top: 1px;
        right: 14px;
        color: #000000;
        opacity: 0.4;
        cursor: pointer;
        transition: opacity 0.3s $transition;
        font-size: 36px;
        -webkit-text-stroke: 1px;


        &:hover {
          opacity: 0.7;
        }
      }

      .participants {
        margin-top: $SPACE_XS;
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
      padding: $SPACE_M;
      text-align: center;
      font-weight: 500;
      font-family: $SANS_STACK;
    }

    .image {
      width: 100%;
      padding-top: $SPACE_M;
      padding-bottom: $SPACE_M;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
      }
    }

    @include text;

    .connected-case-studies {
      padding: $SPACE_M;
    }
  }
</style>

<div class="event-single" in:fade use:links>
  {#if showVideo}
    <VideoPlayer streamUrl={url} />
  {/if}

  {#if event.title}
    <!-- HEADER -->
    <div class="main-header">
      <!-- TITLE -->
      <div class="title">{event.title}</div>
      <!-- ARROW DOWN -->
      <div class="expand" on:click={() => {
        expanded = !expanded
      }}>
        {#if expanded}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="40"
            viewBox="0 0 24 24"
            width="40"><path d="M0 0h24v24H0z" fill="none" />
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" /></svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="40"
            viewBox="0 0 24 24"
            width="40"><path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
        {/if}
      </div>
      <!-- TOGGLE VIDEO -->
      <div class="toggleVideo" on:click={() => {
        showVideo = !showVideo
      }}>
        {#if showVideo}×{:else}+{/if}
      </div>

      <!-- PARTICIPANTS -->
      <div class="participants">
        {#if get(event, 'moderators', false) && Array.isArray(event.moderators)}
          <ParticipantsList
            participants={event.moderators}
            messaging={true}
            isModerators />
        {/if}
        {#if get(event, 'participants', false) && Array.isArray(event.participants)}
          <ParticipantsList
            participants={event.participants}
            messaging={true} />
        {/if}
      </div>
    </div>
    <div class="divider" />

    {#if expanded}
      <!-- TEXT -->
      {#if Array.isArray(get(event, 'content.content', false)) && event.content.content.length > 0}
        <div class="text">
          {@html renderBlockText(event.content.content)}
        </div>
        <div class="divider" />
      {/if}

      <!-- CONNECTED CASE STUDIES -->
      <div class="connected-case-studies">
        {#if Array.isArray(get(event, 'connectedCaseStudies')) && event.connectedCaseStudies.length > 0}
          <CaseStudyList caseStudies={event.connectedCaseStudies} related={true} />
        {/if}
      </div>
    {/if}
  {/if}
</div>
