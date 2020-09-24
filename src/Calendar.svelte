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
  import { formattedDate } from "./global.js"

  // COMPONENTS
  import ParticipantsList from "./ParticipantsList.svelte"

  // *** PROPS
  export let events = []
</script>

<style lang="scss">
  @import "./variables.scss";

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
      cursor: pointer;
      color: $COLOR_DARK;
      display: block;
      text-decoration: none;
      // display: flex;
      // align-items: center;

      .inner {
        width: 100%;
        .row {
          width: 100%;
          display: flex;
          justify-content: space-between;

          .title {
            // font-size: $FONT_SIZE_MEDIUM;
            font-family: $sans-stack;
            font-weight: bold;
            white-space: nowrap;
          }

          .elips {
            margin-left: 10px;
            margin-right: 10px;
            width: 50%;
            white-space: nowrap;
            overflow: hidden;
            flex-shrink: 4;
            display: none;
          }

          .date {
            white-space: nowrap;
          }

          .participants {
            pointer-events: none;
          }
        }
      }
      transition: background 0.5s $transition;

      &:hover {
        background: $COLOR_MID_1;
      }

      &.footer {
        height: 40px;
        border-top: 2px solid $COLOR_MID_1;
        position: absolute;
        bottom: 0;
        left: 0;
        &:hover {
          background: $COLOR_LIGHT;
        }
      }

      &.header {
        position: absolute;
        height: 40px;
        border-bottom: 2px solid $COLOR_MID_1;
        top: 0;
        left: 0;
        &:hover {
          background: $COLOR_LIGHT;
        }
      }
    }
  }
</style>

<div class="calendar-container">
  <!-- HEADER -->
  <div class="calendar-item header">
    <div class="inner">
      <div class="row">
        <div>Events</div>
        <div>Event Archive</div>
      </div>
    </div>
  </div>

  <!-- EVENTS -->
  {#each events as event, index (event._id)}
    <a
      class="calendar-item"
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
  <div class="calendar-item footer">
    <div class="inner">
      <div class="row">
        <div class="title">Mississippi exhibition</div>
        <div class="elips">
          .........................................................
        </div>
        <div class="date">Ongoing Exhibition</div>
      </div>
    </div>
  </div>
</div>
