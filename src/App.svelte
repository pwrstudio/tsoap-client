<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP Client
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { Router, Route } from 'svelte-routing'

  // ROUTES
  import World from './World.svelte'
</script>

<style lang="scss">
  @import './variables.scss';

  * {
    box-sizing: border-box;
  }
</style>

<Router>
  <Route path="/">
    <World />
  </Route>
  <Route path="/create-account">
    <World login={true} />
  </Route>
  <Route path="/position/:x/:y" let:params>
    <World position={true} x={params.x} y={params.y} />
  </Route>
</Router>
