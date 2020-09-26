<script>
  // # # # # # # # # # # # # #
  //
  //  Login
  //
  // # # # # # # # # # # # # #

  const SSO_SERVER = "https://sso.tsoap.dev/auth/discourse_sso"

  const authenticateAccreditedUser = () => {
    window.location = SSO_SERVER
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  * {
    box-sizing: border-box;
  }

  .login {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;

    .box {
      background: #a4a4a4;
      width: 400px;
      padding: 20px;

      .section {
        border-bottom: 1px solid rgba(255, 255, 255, 0.9);
        margin-bottom: 20px;
        padding-bottom: 20px;
      }

      .header {
        font-weight: bold;
        margin-bottom: 20px;
        width: 100%;
      }

      input[type="text"] {
        display: block;
        width: 100%;
        margin-bottom: 10px;
        background: $COLOR_MID_1;
        padding: 10px;
        border: 0;
        outline: none;
      }

      input[type="color"] {
        display: block;
        margin-bottom: 10px;
      }

      button {
        width: 60px;
        // float: right;
        display: block;
        background: $COLOR_MID_2;
        padding: 10px;
        width: 100%;
        border: 0;
        outline: none;
        color: white;
        cursor: pointer;
        &:hover {
          background: $COLOR_MID_3;
        }
      }
    }
  }
</style>

<div class="login">
  <div class="box">
    <div class="section">
      <div class="header">Login as accredited user</div>
      <button on:click={authenticateAccreditedUser}>Authenticate</button>
    </div>
  </div>
</div>
