<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP Client
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { Router, Route } from "svelte-routing"

  // ROUTES
  import World from "./World.svelte"
</script>

<Router>
  <Route path="/authenticate/:sso/:sig" component={World} authenticate={true} />
  <Route path="/*" let:params>
    <World {params} />
  </Route>
</Router>
