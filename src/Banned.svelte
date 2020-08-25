<script>
  // # # # # # # # # # # # # #
  //
  //  BANNED OVERLAY
  //
  // # # # # # # # # # # # # #
</script>

<style lang="scss">
  @import "./variables.scss";

  .banned {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;

    .box {
      background: red;
      padding: 20px;
      font-size: 16vw;
      text-align: center;
      user-select: none;

      .header {
        font-weight: bold;
      }
    }
  }
</style>

<div class="banned">
  <div class="box">
    <div class="header">BANNED</div>
  </div>
</div>
