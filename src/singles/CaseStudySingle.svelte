<script>
  // # # # # # # # # # # # # #
  //
  //  Single Case Study
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { urlFor, renderBlockText, loadData } from "../sanity.js"
  import { links } from "svelte-routing"

  import { FORMATMAP, QUERY } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"
  import EventList from "../lists/EventList.svelte"

  // *** PROPS
  export let caseStudy = {}
  // const relatedEvents = loadData(QUERY.RELATED_EVENTS, {id: caseStudy._id})
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .case-study-single {
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

    .material {
      padding: 15px;

      .material-item {
        width: 100%;
        // height: $ITEM_HEIGHT;
        background: $COLOR_LIGHT;
        color: $COLOR_DARK;
        display: block;
        text-decoration: none;
        user-select: none;
        padding-top: 5px;
        padding-bottom: 10px;

        .row {
          width: 100%;

          display: flex;
          justify-content: space-between;

          .title {
            font-family: $SANS_STACK;
            font-weight: 400;
            white-space: nowrap;
          }

          .elips {
            margin-left: 5px;
            margin-right: 5px;
            width: 90%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 4;
            color: $COLOR_MID_2;
          }

          .format {
            white-space: nowrap;
            color: $COLOR_MID_2;
          }
        }

        cursor: pointer;

        // transition: background 0.5s $transition;

        &:hover {
          background: $COLOR_MID_1;
        }

        &.header {
          border-bottom: 1px dotted $COLOR_MID_1;
          cursor: default;

          .archive-link {
            color: $COLOR_MID_2;
            text-decoration: underline;
          }

          &:hover {
            background: unset;
          }
        }
      }
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
  }
</style>

<div class="case-study-single" in:fade use:links>
  <!-- HEADER -->

  <div class="main-header">
    <!-- TITLE -->
    <div class="title">{caseStudy.title}</div>

    <!-- PARTICIPANTS -->
    {#if get(caseStudy, 'participants', false) && Array.isArray(caseStudy.participants)}
      <div class="participants">
        <ParticipantsList participants={caseStudy.participants} />
      </div>
    {/if}
  </div>

  <div class="divider" />

  <!-- MATERIAL -->
  <div class="material">
    <div class="material-item header">
      <div class="row">
        <div class="title">Material</div>
        <div class="format">File format</div>
      </div>
    </div>
    {#if Array.isArray(caseStudy.material)}
      {#each caseStudy.material as item (item._key)}
        <div class="material-item">
          <div class="row">
            <div class="title">{item.title}</div>
            <div class="elips">
              ....................................................................
            </div>
            <div class="format">
              {item._type === 'fileBlock' ? item.fileType : FORMATMAP[item._type]}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <div class="divider" />

  <!-- TEXT -->
  <div class="text">
    {#if Array.isArray(get(caseStudy, 'content.content', false))}
      {@html renderBlockText(caseStudy.content.content)}
    {/if}
  </div>

  <div class="divider" />

  <!-- RELATED EVENTS -->
  <div class="related-events">
    <!-- {await relatedEvents then relatedEvents} -->
    {#if Array.isArray(get(caseStudy, 'connectedEvents', false))}
      <EventList events={caseStudy.connectedEvents} related={true} />
    {/if}
    <!-- {/await} -->
  </div>
</div>
