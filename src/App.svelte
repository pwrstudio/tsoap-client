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
  <Route path="/" component={World} />
  <Route path="/authenticate/:sso/:sig" component={World} authenticate={true} />
  <Route path="/:section" component={World} />
  <Route path="/:section/:slug" component={World} />
</Router>
