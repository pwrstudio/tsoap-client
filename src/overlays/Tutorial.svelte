<script>
  // # # # # # # # # # # # # #
  //
  //  CARD
  //
  // # # # # # # # # # # # # #

  //   *** IMPORT
  import { renderBlockText } from "../sanity.js"
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { links } from "svelte-routing"

  // PROPS
  export let card = {}
  export let showWelcomeCard = false;

  let currentIndex = 0
  
  // USE STATIC PLACEHOLDER DATA INSTEAD OF PROP RIGHT NOW
  // let placeholder = { "_createdAt": "2020-10-17T15:19:18Z", "_id": "e8a62d6b-47b2-480b-969e-c8c3484b88e1", "_rev": "SjWRppsyOVqEjhkK9WxpXs", "_type": "card", "_updatedAt": "2020-10-19T08:46:20Z", "slides": [ { "_key": "f8f5bb80c841", "_type": "content", "content": [ { "_key": "33f86a6c1065", "_type": "block", "children": [ { "_key": "feb9e5a638ad", "_type": "span", "marks": [], "text": "Uff… that was quite the fall! But you’re just a few pixels and pixels don’t actually fall… they move across a screen...\n\nSo the thing about falling… everything arrives like that from the top of the screen." } ], "markDefs": [], "style": "normal" }, { "_key": "63ca8ad370e1", "_type": "block", "children": [ { "_key": "c01fbc392e47", "_type": "span", "marks": [], "text": "Testing an " }, { "_key": "e3d55bba32ae", "_type": "span", "marks": [ "94d4a8e8a653" ], "text": "internal link" }, { "_key": "86a549a62154", "_type": "span", "marks": [], "text": "." } ], "markDefs": [ { "_key": "94d4a8e8a653", "_type": "link", "href": "/profiles/rasmus" } ], "style": "normal" }, { "_key": "d0ec3e095738", "_type": "block", "children": [ { "_key": "7df61e859a80", "_type": "span", "marks": [], "text": "And one with " }, { "_key": "82f97c207b92", "_type": "span", "marks": [ "61c5da156f99" ], "text": "full address" }, { "_key": "f5e53f72bb59", "_type": "span", "marks": [], "text": "." } ], "markDefs": [ { "_key": "61c5da156f99", "_type": "link", "href": "https://tsoap-client.netlify.app/events/test-event" } ], "style": "normal" }, { "_key": "20af2a365955", "_type": "block", "children": [ { "_key": "3ff305a3f9fc", "_type": "span", "marks": [], "text": "Teting an " }, { "_key": "91d648064bb5", "_type": "span", "marks": [ "ab9118d7438a" ], "text": "external link" }, { "_key": "339068bdce4e", "_type": "span", "marks": [], "text": "." } ], "markDefs": [ { "_key": "ab9118d7438a", "_type": "link", "href": "https://www.are.na/" } ], "style": "normal" }, { "_key": "cd3c1682041d", "_type": "block", "children": [ { "_key": "ebafeae87842", "_type": "span", "marks": [], "text": "" } ], "markDefs": [], "style": "normal" } ] }, { "_key": "c584ce9513ca", "_type": "content", "content": [ { "_key": "4253e9a063f1", "_type": "block", "children": [ { "_key": "4cf5d7e69081", "_type": "span", "marks": [], "text": "Those pink, green, yellow, and blue pixels are case-studies, collections of raw research material." } ], "markDefs": [], "style": "normal" }, { "_key": "053dc426a1e1", "_type": "block", "children": [ { "_key": "f9c17fbe9db1", "_type": "span", "marks": [], "text": "Once here, in the Gathering Space, " }, { "_key": "1034f9c43808", "_type": "span", "marks": [], "text": "all case-studies are sorted according to the type of practice they reflect..." } ], "markDefs": [], "style": "normal" }, { "_key": "a408cac7fe3d", "_type": "block", "children": [ { "_key": "bf753b8d1586", "_type": "span", "marks": [], "text": "Communicating, Sensing, Archiving and Consensus Building." } ], "markDefs": [], "style": "normal" } ] }, { "_key": "d7d2a0717b02", "_type": "content", "content": [ { "_key": "444c8a0e0d21", "_type": "block", "children": [ { "_key": "95b3ef3c5171", "_type": "span", "marks": [], "text": "But! Your task is to intervene within the sorting and classification of information." } ], "markDefs": [], "style": "normal" }, { "_key": "e21d7bcf64fa", "_type": "block", "children": [ { "_key": "68dfd5a6a1ea", "_type": "span", "marks": [], "text": "When you look at a case-study you pick it up and can drop it wherever you wish." } ], "markDefs": [], "style": "normal" }, { "_key": "813931e42cec", "_type": "block", "children": [ { "_key": "5815004872e0", "_type": "span", "marks": [], "text": "Negotiate, discuss and create new constellations of research and new types of practices!" } ], "markDefs": [], "style": "normal" } ] }, { "_key": "393d9e656163", "_type": "content", "content": [ { "_key": "3d0c2206b342", "_type": "block", "children": [ { "_key": "1a427a344744", "_type": "span", "marks": [], "text": "Along the way, you’ll find video streams, research installations, chat and audio rooms. Use them to inform and challenge your thinking." } ], "markDefs": [], "style": "normal" }, { "_key": "99c313e499b7", "_type": "block", "children": [ { "_key": "af6408d988a3", "_type": "span", "marks": [], "text": "Now you're ready to adopt an avatar to navigate around the space and find various portals into the materials and discussions." } ], "markDefs": [], "style": "normal" }, { "_key": "e05382cf79f0", "_type": "block", "children": [ { "_key": "52b71ae36438", "_type": "span", "marks": [], "text": "What are you waiting for!" } ], "markDefs": [], "style": "normal" } ] } ], "title": "Welcome Narrative Test - 2" }
  // console.dir("tutorial content =", card)
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
    padding: $SPACE_L;
    margin: 0 auto;
    background: $COLOR_MID_1;
    color: $COLOR_DARK;
    display: flex;
    // justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    width: 60vw;
    max-width: 900px;
    height: 70%;
    pointer-events: all;
    position:relative;

    @include screen-size("small"){
      font-size: $FONT_SIZE_SMALL;
      width: calc(100vw - #{$SPACE_M}*2);
      height: calc(100% - #{$SPACE_M}*2);
    }

    .placeholder-img{
      margin:$SPACE_L 0;
      background-color: $COLOR_DARK;
      width: 200px;
      height: 200px;
      display:block;
    }

    .tutorial-slide :global(figure) { 
      display:block;
      
    };

    .tutorial-slide :global(img) { 
      max-width: 50%;
      margin: unset;
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
      background:red;
      width: $SPACE_L;
      height: $SPACE_L;
      margin-bottom: $SPACE_XS * -1;
      margin-right:$SPACE_XS;
      display: inline-block;
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
    {#if Array.isArray(get(slide, 'content', false)) && currentIndex === index}
      <div class="tutorial-slide" in:fade|local>
        {@html renderBlockText(get(slide, 'content', []))}
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
          console.log(showWelcomeCard);
          showWelcomeCard = false;
        }}>
        Enter
      </div>
      {/if}
    </div>
  {/if}
</div>
</div>