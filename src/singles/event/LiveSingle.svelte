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

  // COMPONENTS
  import ParticipantsList from "../../lists/ParticipantsList.svelte"
  import CaseStudyList from "../../lists/CaseStudyList.svelte"
  import VideoPlayer from "./VideoPlayer.svelte"

  // GLOBAL
  import { formattedDate, QUERY } from "../../global.js"

  // *** PROPS
  export let event = {}

  let expanded = false
  let connectedCaseStudies = []

  if (event._id) {
    connectedCaseStudies = loadData(QUERY.CONNECTED_CASE_STUDIES, {
      id: event._id,
    })
  }

  // connectedCaseStudies.then((connectedCaseStudies) => {
  //   console.dir(connectedCaseStudies)
  // })
</script>

<style lang="scss">
  @import "../../variables.scss";

  $ITEM_HEIGHT: 60px;

  .event-single {
    .main-header {
      padding: 15px;
      position: relative;
      user-select: none;

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

<div class="event-single" in:fade use:links>
  <VideoPlayer streamUrl={event.streamURL} />

  {#if event.title}
    <!-- HEADER -->
    <div class="main-header" on:click={() => {
      expanded = !expanded}}>
    <!-- TITLE -->
    <div class="title">{event.title}</div>
    <!-- ARROW DOWN -->
    <div class='expand'>
      {#if expanded}
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
      {/if}
    
    </div>

    <!-- PARTICIPANTS -->
    {#if get(event, 'participants', false) && Array.isArray(event.participants)}
      <div class="participants">
        <ParticipantsList participants={event.participants} />
      </div>
    {/if}
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
      {#await connectedCaseStudies then connectedCaseStudies}
        <CaseStudyList caseStudies={connectedCaseStudies} related={true} />
      {/await}
    </div>
    {/if}
  {/if}
</div>
