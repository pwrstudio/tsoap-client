<script>
  // # # # # # # # # # # # # #
  //
  //  BANNED OVERLAY
  //
  // # # # # # # # # # # # # #
</script>

<style lang="scss">
  @import "../variables.scss";

  .banned {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: red;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;

    .box {
      font-family: $MONO_STACK;
      padding: 20px;
      font-size: 64px;
      text-align: center;
      user-select: none;
    }
  }
</style>

<div class="banned">
  <div class="box">BANNED</div>
</div>
