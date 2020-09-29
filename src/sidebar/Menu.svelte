<script>
  // # # # # # # # # # # # # #
  //
  //  Menu
  //
  // # # # # # # # # # # # # #

  // *** PROPS
  export let authenticated = false
</script>

<style lang="scss">
  @import "../variables.scss";

  .menu-container {
    height: 100%;
    color: $COLOR_DARK;
    font-size: $FONT_SIZE_BASE;
    background: $COLOR_LIGHT;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    padding-left: 10px;
    padding-right: 10px;

    .menu-item {
      padding-right: 20px;
      float: left;
      cursor: pointer;
      color: $COLOR_DARK;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .login {
      padding-right: 0px;
      justify-self: end;
    }
  }
</style>

<div class="menu-container">
  <div>
    <a href="/case-studies" class="menu-item">Case-Studies</a>
    <a href="/pages/about" class="menu-item">About</a>
    <a href="/pages/help" class="menu-item">Help</a>
  </div>

  {#if authenticated}
    <a href="/" class="menu-item login">Logout</a>
  {:else}
    <a
      href="https://sso.tsoap.dev/auth/discourse_sso"
      class="menu-item login">Login</a>
  {/if}
</div>
