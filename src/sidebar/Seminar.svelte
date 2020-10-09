<script>
  // # # # # # # # # # # # # #
  //
  //  Seminar
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import get from "lodash/get"
  import { loadData, renderBlockText } from "../sanity.js"

  // COMPONENTS
  import ParticipantsList from "../lists/ParticipantsList.svelte"

  // GLOBAL
  import { QUERY } from "../global.js"

  // *** STORES
  import { authenticatedUserInformation } from "../stores"

  // PROPS
  export let slug = "test-seminar-1"

  // __ If there is no slug, show user's own seminar
  if (!slug || slug.length == 0) {
    slug = get(
      $authenticatedUserInformation,
      "seminarLink.slug.current",
      "test-seminar-4"
    )
  }

  let seminar = loadData(QUERY.SEMINAR, { slug: slug }).catch(err => {
    console.dir(err)
  })
  let loadedParticipants = []

  seminar.then(seminar => {
    if (seminar && seminar._id) {
      // Get participants of seminar
      loadData(QUERY.SEMINAR_PARTICIPANTS, {
        id: seminar._id,
      })
        .then(connectedParticipants => {
          loadedParticipants = connectedParticipants
        })
        .catch(err => {
          console.log(err)
        })
    }
  })
</script>

<style lang="scss">
  @import "../variables.scss";

  .seminar-container {
    position: relative;
    height: 100%;
    font-size: $FONT_SIZE_SMALL;

    .header {
      font-size: $FONT_SIZE_SMALL;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 7px;
      padding-bottom: 7px;
      width: 100%;
      background: $COLOR_DARK;
      color: $COLOR_LIGHT;
      border-bottom: 1px solid $COLOR_LIGHT;
      text-align: left;
    }

    .body-container {
      width: 100%;
      height: calc(100% - 30px);
      overflow-y: auto;
      padding: 10px;
      color: $COLOR_MID_2;

      @include hide-scroll;
    }

    .link {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10px;
      margin-bottom: 10px;
      user-select: none;

      a {
        color: $COLOR_LIGHT;
        border: 1px solid $COLOR_MID_2;
        border-radius: 10px;
        padding: 10px;
        text-decoration: none;

        &:hover {
          border: 1px solid $COLOR_LIGHT;
        }
      }
    }
  }
</style>

<div class="seminar-container">
  {#await seminar then seminar}
    <div class="header">{seminar.title}</div>
    <div class="body-container">
      <!-- TEXT BLOCK #1 -->
      {#if Array.isArray(get(seminar, 'firstTextBlock.content', false)) && seminar.firstTextBlock.content.length > 0}
        <div class="text-block">
          {@html renderBlockText(seminar.firstTextBlock.content)}
        </div>
      {/if}
      <!-- LINK: MORE INFORMATION -->
      <div class="link">
        <a href={seminar.moreInformationLink} target="_blank">More information</a>
        </div>
      <!-- TEXT BLOCK #2 -->
      {#if Array.isArray(get(seminar, 'secondTextBlock.content', false)) && seminar.secondTextBlock.content.length > 0}
        <div class="text-block">
          {@html renderBlockText(seminar.secondTextBlock.content)}
        </div>
      {/if}
      <!-- LINK: BIG BLUE BUTTON -->
      <div class="link">
        <a href={seminar.bbbLink} target="_blank">Join on BigBlueButton</a>
        </div>
      <!-- PARTICIPANTS LIST -->
      <div class="participants-list">
          <div>Participants in seminar:</div>
          <ParticipantsList participants={loadedParticipants} messaging={true}/>
        </div>
    </div>
  {/await}
</div>
