<script>
  // # # # # # # # # # # # # #
  //
  //  Case Study View
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import get from 'lodash/get'
  import { fly } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let caseStudy = {}

  // COMPONENTS
</script>

<style lang="scss">
  @import './variables.scss';

  .folder {
    position: fixed;
    width: 400px;
    background: $grey;
    height: auto;
    line-height: 100px;
    text-align: center;
    top: 10px;
    right: 10px;
    padding: 20px;
    line-height: 1.4em;
    border-radius: 10px;
    z-index: 1000;
    cursor: pointer;

    .content {
      text-align: left;
    }

    @include screen-size('small') {
      top: 20px;
      left: 20px;
      width: calc(100vw - 40px);
    }
  }
</style>

<div
  class="folder"
  transition:fly={{ y: 200 }}
  on:click={() => {
    dispatch('closeCaseStudy')
  }}>
  <h2>{caseStudy.title}</h2>
  <div class="content">{caseStudy.content}</div>
</div>
