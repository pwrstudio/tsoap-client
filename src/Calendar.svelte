<script>
  // # # # # # # # # # # # # #
  //
  //  Calendar
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import { fade } from "svelte/transition"
  import get from "lodash/get"
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  // *** GLOBAL
  import { formattedDate } from "./global.js"

  // *** PROPS
  export let events = []
</script>

<style lang="scss">
  @import "./variables.scss";

  .calendar-container {
    position: relative;
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;

    .calendar-item {
      padding: 10px;
      width: calc(100% - 20px);
      display: flex;
      justify-content: space-between;
      padding-bottom: 20px;
      padding-top: 20px;
      background: $COLOR_LIGHT;
      cursor: pointer;

      .title {
        white-space: nowrap;
      }

      .elips {
        margin-left: 10px;
        margin-right: 10px;
        width: 50%;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 4;
      }

      .date {
        white-space: nowrap;
      }

      transition: background 0.5s $transition;

      &:hover {
        background: $COLOR_MID_1;
      }
    }
  }
</style>

<div class="calendar-container">
  {#each events as event, index (event._id)}
    <div
      class="calendar-item"
      in:fade={{ delay: 100 * index }}
      on:click={(e) => {
        dispatch('goToEvent', { slug: get(event, 'slug.current', '') })
      }}>
      <div class="title">{event.title}</div>
      <div class="elips">
        .........................................................
      </div>
      <div class="date">{formattedDate(event.startDate)}</div>
    </div>
  {/each}
</div>
