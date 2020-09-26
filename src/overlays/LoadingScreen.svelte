<script>
  // # # # # # # # # # # # # #
  //
  //  LOADING SCREEN
  //
  // # # # # # # # # # # # # #

  let counter = 0

  const inc = () => {
    counter++
    requestAnimationFrame(inc)
  }

  requestAnimationFrame(inc)
</script>

<style lang="scss">
  @import "../variables.scss";

  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;

    .box {
      font-family: $mono-stack;
      padding: 20px;
      font-size: 48px;
      text-align: center;
      user-select: none;
    }
  }
</style>

<div class="loading-screen">
  <div class="box">
    <div class="header">LOADING: {counter}</div>
  </div>
</div>
