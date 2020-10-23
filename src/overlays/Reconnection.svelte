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
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100000;
  
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
      <div class="header">You have been disconnected from the gameserver. (Code:{disconnectionCode})</div>
      <div class="header">Attempting to reconnect...</div>
    </div>
  </div>
  