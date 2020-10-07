<script>
  // # # # # # # # # # # # # #
  //
  //  Single User Profile
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"

  // *** GLOBALS
  import { QUERY } from "../global.js"

  // COMPONENTS
  import EventList from "../lists/EventList.svelte"
  import CaseStudyList from "../lists/CaseStudyList.svelte"

  // *** PROPS
  export let user = {}

  let relatedCaseStudies = false
  let relatedEvents = false

  const relatedContent = loadData(QUERY.CONNECTED_TO_USER, { id: user._id })

  relatedContent.then(relatedContent => {
    if (relatedContent && Array.isArray(relatedContent)) {
      relatedEvents = relatedContent.filter(c => c._type == "event")
      relatedCaseStudies = relatedContent.filter(
        c => c._type == "caseStudyExhibition" || c._type == "caseStudyEmergent"
      )
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .user-profile-single {
    .go-back {
      padding-top: 5px;
      padding-left: 10px;
      cursor: pointer;
      svg {
        path {
          fill: $COLOR_MID_2;
        }
      }
    }

    .main-header {
      padding: 15px;

      .title {
        font-family: $SANS_STACK;
        font-size: $FONT_SIZE_LARGE;
        font-weight: 500;
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

    .text {
      padding: 15px;
      font-family: $SANS_STACK;
      font-size: $FONT_SIZE_BASE;
      font-weight: 400;
      line-height: 1.4em;
    }

    .related-events {
      padding: 15px;
    }

    .connected-case-studies {
      padding: 15px;
      padding-top: 0;
    }
  }
</style>

<div class="user-profile-single" in:fade use:links>
  <!-- BACK LINK -->
  <div class='go-back' on:click={e => {
      window.history.back()}}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/></svg>
    </div>
  <!-- HEADER -->
  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{user.name}</div>
  </div>
  <div class="divider" />

  <!-- BIOGRAPHY -->
  {#if Array.isArray(get(user, 'biography.content', false))}
    <div class="text">
      {@html renderBlockText(user.biography.content)}
    </div>
    <div class="divider" />
  {/if}

  <!-- RELATED EVENTS -->
  <div class="related-events">
    {#if relatedEvents && Array.isArray(relatedEvents) && relatedEvents.length > 0}
      <EventList events={relatedEvents} related={true} />
    {/if}
  </div>

  <!-- CONNECTED CASE STUDIES -->
  <div class="connected-case-studies">
    {#if relatedCaseStudies && Array.isArray(relatedCaseStudies) && relatedCaseStudies.length > 0}
      <CaseStudyList caseStudies={relatedCaseStudies} related={true} />
    {/if}
  </div>
</div>
