<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP Client
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { Router, Route } from "svelte-routing";

  // ROUTES
  import World from "./World.svelte";
</script>

<style lang="scss" global>
  @import "./variables.scss";
  * {
    box-sizing: border-box;
  }
</style>

<Router>
  <Route path="/" component={World} debug={true} />
  <Route path="/authenticate/:sso/:sig" component={World} authenticate={true} />
  <Route path="/login" component={World} login={true} debug={true} />
  <Route path="/debug" component={World} debug={true} />
</Router>
