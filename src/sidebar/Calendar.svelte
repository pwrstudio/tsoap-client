<script>
  // # # # # # # # # # # # # #
  //
  //  Calendar
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"

  // *** GLOBAL
  import { formattedDate } from "../global.js"

  // COMPONENTS
  import ParticipantsList from "../ParticipantsList.svelte"

  // *** PROPS
  export let events = []
  export let related = false
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .calendar-container {
    position: relative;
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;
    padding-top: 40px;
    padding-bottom: 40px;

    .calendar-item {
      padding: 0px 10px;
      padding-top: 10px;
      width: 100%;
      height: $ITEM_HEIGHT;
      background: $COLOR_LIGHT;
      color: $COLOR_DARK;
      display: block;
      text-decoration: none;
      user-select: none;

      &.related {
        padding-left: 0;
        padding-right: 0;
      }

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

      &.footer {
        height: 40px;
        border-top: 1px solid $COLOR_MID_1;
        position: absolute;
        bottom: 0;
        left: 0;
        &:hover {
          background: unset;
        }
      }

      &.header {
        position: absolute;
        height: 40px;
        border-bottom: 1px solid $COLOR_MID_1;
        top: 0;
        left: 0;

        .archive-link {
          color: $COLOR_MID_2;
          text-decoration: underline;
        }

        &.related {
          border-bottom: 1px dotted $COLOR_MID_1;
        }

        &:hover {
          background: unset;
        }
      }
    }
  }
</style>

<div class="calendar-container">
  <!-- HEADER -->
  <div class="calendar-item header" class:related>
    <div class="inner">
      <div class="row">
        <div>{related ? 'Related Events' : 'Events'}</div>
        <div class="archive-link">{related ? 'View All' : 'Event Archive'}</div>
      </div>
    </div>
  </div>

  <!-- EVENTS -->
  {#each events as event, index (event._id)}
    <a
      class="calendar-item"
      class:related
      in:fade={{ delay: 100 * index }}
      href={'/events/' + get(event, 'slug.current', '')}>
      <div class="inner">
        <div class="row">
          <div class="title">{event.title}</div>
          <div class="elips">
            .........................................................
          </div>
          <div class="date">{formattedDate(event.startDate)}</div>
        </div>
        <div class="row">
          <div class="participants">
            {#if get(event, 'participants', false) && Array.isArray(event.participants)}
              <ParticipantsList participants={event.participants} />
            {/if}
          </div>
        </div>
      </div>
    </a>
  {/each}

  <!-- FOOTER -->
  {#if !related}
    <div class="calendar-item footer">
      <div class="inner">
        <div class="row">
          <div class="title">Mississippi exhibition</div>
          <div class="elips">
            .........................................................
          </div>
          <div class="date">Ongoing</div>
        </div>
      </div>
    </div>
  {/if}
</div>
