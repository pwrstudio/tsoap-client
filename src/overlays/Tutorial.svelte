<script>
  // # # # # # # # # # # # # #
  //
  //  CARD
  //
  // # # # # # # # # # # # # #

  // *** IMPORT
  import { urlFor, renderBlockText } from "../sanity.js"
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { links } from "svelte-routing"

  // *** PROPS
  export let card = {}
  export let showWelcomeCard = false;

  // *** VARIABLES
  let currentIndex = 0
</script>

<style lang="scss">
  @import "../variables.scss";

  .tutorial-wrap-inner{
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    height:100%;
    pointer-events: none;
  }
  .tutorial {
    font-size: $FONT_SIZE_LARGE;
    font-family: $SANS_STACK;
    padding: $SPACE_L $SPACE_L $SPACE_L*3 $SPACE_L;
    margin: 0 auto;
    background: $COLOR_MID_1;
    color: $COLOR_DARK;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 50vw;
    max-width: 900px;
    min-height: 60%;
    pointer-events: all;
    position:relative;

    @include screen-size("small"){
      font-size: $FONT_SIZE_SMALL;
      width: calc(100vw - #{$SPACE_M}*2);
      height: calc(100% - #{$SPACE_M}*2);
    }

    .tutorial-slide :global(figure) { 
      display:block;
      margin:$SPACE_L 0;
      @include screen-size("small"){
        margin:$SPACE_S 0;
      }
    };

    .tutorial-slide :global(img) { 
      max-width: 50%;
      margin: unset;
      object-fit: cover;
      @include screen-size("small"){
        max-width: 100%;
      }
    };

    .tutorial-slide :global(ol) { 
      list-style-type: none;
      padding:0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      @include screen-size("small"){
        justify-content: center;
      }
    };

    .tutorial-slide :global(li) { 
      white-space: nowrap;
      margin-bottom: $SPACE_BASE;
      @include screen-size("small"){
        margin-right:$SPACE_BASE;
      }
    };

    .tutorial-slide :global(li::before) { 
      content:(' ');
      width: $SPACE_L;
      height: $SPACE_L;
      margin-bottom: $SPACE_XS * -1;
      margin-right:$SPACE_S;
      display: inline-block;
      @include screen-size("small"){
        margin-right:$SPACE_XS;
      }
    };

    .tutorial-slide :global(li:nth-of-type(1)::before) { 
      background:$COLOR_COMMUNICATION;
    };
    .tutorial-slide :global(li:nth-of-type(2)::before) { 
      background:$COLOR_SENSING;
    };
    .tutorial-slide :global(li:nth-of-type(3)::before) { 
      background:$COLOR_ARCHIVING;
    };
    .tutorial-slide :global(li:nth-of-type(4)::before) { 
      background:$COLOR_CONSENSUS_BUILDING;
    };


    .tutorial-slide{
      font-family: $MONO_STACK;
      width: 90%;
      min-height: 30%;
      text-align: center;

      @include screen-size("small"){
        width: 100%;
      }
      
      figure{
        max-width: 60%;
      }
    }

    .navigation {
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: $SPACE_L;

      .nav-button {
        font-size: $FONT_SIZE_BASE;
        padding: $SPACE_S*0.9 $SPACE_S;
        background: $COLOR_LIGHT;
        font-family: $MONO_STACK;
        transition:background 150ms $transition;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;

        &:hover {
          background: $COLOR_MID_15;
        }

        &.back {
          margin-right: 10px;
        }

        &.enter{
          background-color: $COLOR_DARK;
          color: $COLOR_LIGHT;
        }

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      }
    }

    .close {
        margin-bottom: 20px;
        position: absolute;
        top: -6px;
        right: $SPACE_S;
        font-size: 38px;
        color: $COLOR_MID_2;
        cursor: pointer;
        text-decoration: none;
        transition: color 0.3s $transition;
        z-index: 10000;

        @include screen-size("small") {
          margin-bottom: 0;
          margin-top: 0;

          &.passive {
            min-height: 100vh;
          }
        }

        &:hover {
          // transform: scale(1.1);
          color: $COLOR_MID_3;
        }
      }

      @include screen-size("small") {
        margin-top: 0;
        margin-bottom: 0;

        &.passive {
          min-height: 100vh;
        }
      }
  }
</style>
<div class='tutorial-wrap-inner'>
<div class="tutorial" use:links>
  <div
    class="close"
    on:click={e => {
      showWelcomeCard = false
    }}>
    ×
  </div>
  {#each card.slides as slide, index (slide._key)}
    {#if Array.isArray(get(slide, 'content.content', false)) && currentIndex === index}
      <div class="tutorial-slide" in:fade|local>
        <img height="300" src={urlFor(get(slide, 'topImage', "")).url()} alt='The Shape of a Practice'/>
        {@html renderBlockText(get(slide, 'content.content', []))}
      </div>
    {/if}
  {/each}
  {#if card.slides && card.slides.length > 0}
    <div class="navigation">
      <div
        class="nav-button back"
        class:disabled={currentIndex === 0}
        on:click={e => {
          currentIndex -= 1
        }}>
        Back
      </div>
      {#if currentIndex != card.slides.length - 1}
      <div
        class="nav-button next"
        class:disabled={currentIndex === card.slides.length - 1}
        on:click={e => {
          currentIndex += 1
        }}>
        Next
      </div>
      {:else}
      <div
        class="nav-button enter"
        on:click={e => {
          showWelcomeCard = false;
        }}>
        Enter
      </div>
      {/if}
    </div>
  {/if}
</div>
</div>