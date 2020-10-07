<script>
  // # # # # # # # # # # # # #
  //
  //  Case Study List
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"

  // *** PROPS
  export let caseStudies = []
  export let related = false
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .case-study-container {
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;

    .case-study-item {
      padding: 0px 10px;
      padding-top: 10px;
      width: 100%;
      height: $ITEM_HEIGHT;
      background: $COLOR_LIGHT;
      color: $COLOR_DARK;
      display: block;
      text-decoration: none;
      user-select: none;

      .inner {
        width: 100%;
        .row {
          width: 100%;

          display: flex;
          justify-content: space-between;

          .title {
            font-family: $SANS_STACK;
            font-weight: 500;
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

          .date {
            white-space: nowrap;
            color: $COLOR_MID_2;
          }

          .participants {
            pointer-events: none;
            color: $COLOR_MID_2;
            font-size: $FONT_SIZE_SMALL;
          }
        }
      }

      transition: background 0.5s $transition;

      &:hover {
        background: $COLOR_MID_1;
      }

      &.header {
        // position: absolute;
        // height: 40px;
        border-bottom: 1px dotted $COLOR_MID_1;
        // top: 0;
        // left: 0;

        .archive-link {
          color: $COLOR_MID_2;
          text-decoration: underline;
        }

        &:hover {
          background: unset;
        }
      }

      &.related {
        padding-left: 0;
        padding-right: 0;

        &.header {
          height: 30px;
          padding-top: 0;
        }
      }
    }
  }
</style>

<div class="case-study-container">
  <!-- HEADER -->
  <div class="case-study-item header" class:related>
    <div class="inner">
      <div class="row">
        <div>{related ? 'Connected Case Studies' : 'Case Studies'}</div>
      </div>
    </div>
  </div>

  <!-- CASE STUDIES -->
  {#each caseStudies as caseStudy, index (caseStudy._id)}
    <a
      class="case-study-item"
      class:related
      in:fade={{ delay: index < 10 ? 100 * index : 1000 }}
      href={'/case-studies/' + get(caseStudy, 'slug.current', '')}>
      <div class="inner">
        <div class="row">
          <div class="title">{caseStudy.title}</div>
          <div class="elips">
            .........................................................
          </div>
          <div class="date">{caseStudy.category}</div>
        </div>
        <div class="row">
          <div class="participants">
            {#if get(caseStudy, 'participants', false) && Array.isArray(caseStudy.participants)}
              <ParticipantsList participants={caseStudy.participants} />
            {/if}
          </div>
        </div>
      </div>
    </a>
  {/each}
</div>
