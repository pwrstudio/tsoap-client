<script>
    // # # # # # # # # # # # # #
    //
    //  RECONNECTION SCREEN
    //
    // # # # # # # # # # # # # #
  
    // *** PROPS
    export let reconnectionAttempts = 0
    export let disconnectionCode = 0
  </script>
  
  <style lang="scss">
    @import "../variables.scss";
  
    .reconnection {
      // position: fixed;
      // top: 0;
      // left: 0;
      // width: 100vw;
      // height: 100vh;
      // background: rgba(0,0,0,0.9);
      // display: flex;
      // justify-content: center;
      // align-items: center;
      // z-index: 100000;

      position: fixed;
      bottom: 15px;
      left: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
  
  
      .box {
        font-family: $MONO_STACK;
        padding: 20px;
        background: white;
        color: black;
        font-size: $FONT_SIZE_LARGE;
        text-align: center;
        user-select: none;
      }
    }
  </style>
  
  <div class="reconnection">
    <div class="box">
      <div class="header">You have been disconnected from the gameserver. (Error: {disconnectionCode})</div>
      <div class="header">Please reload the page to attempt to reconnect.</div>
      <!-- <div class="header">Attempting to reconnect...</div> -->
    </div>
  </div>
  