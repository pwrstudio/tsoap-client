<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP Client
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { onMount } from "svelte";
  import * as Colyseus from "colyseus.js";
  import * as PIXI from "pixi.js";
  import { Viewport } from "pixi-viewport";
  import Chance from "chance";
  import get from "lodash/get";
  import sample from "lodash/sample";
  import { fade, fly } from "svelte/transition";
  const chance = new Chance();

  // COMPONENTS
  import Chat from "./Chat.svelte";
  import UserList from "./UserList.svelte";

  // STORES
  import {
    localUserUUID,
    localUserName,
    localUserTint,
    localUserSessionID,
    localUserArea
  } from "./stores.js";

  localUserUUID.set(chance.guid());

  // PROPS
  export let login = false;
  export let position = false;
  export let debug = false;
  export let x = 0;
  export let y = 0;

  // GLOBAL
  import { houseList, KEYBOARD, WIDTH, HEIGHT, colorTrans } from "./global.js";

  // DEBUG VARIABLES
  let worldX = 0;
  let worldY = 0;
  let screenX = 0;
  let screenY = 0;
  let rendererHeight = 0;
  let rendererWidth = 0;
  let viewportHeight = 0;
  let viewportWidth = 0;

  // DOM REFERENCES
  let gameContainer = {};

  // VARIABLES
  let popUpText = false;
  let folderActive = false;
  let closePlayers = [];
  let newUserName = "";
  let newUserColor = "";
  let newUserAvatar = 1;
  let loggedIn = false;
  let userLoaded = false;
  let showUserList = false;
  let showChat = false;
  let banned = false;
  let inMotion = false;

  let localPlayers = {};
  let chatMessages = [];
  let moveQ = [];

  let targetGraphics = {}
  let pathGraphics = {}

  // COLYSEUS
  // const client = new Colyseus.Client("ws://localhost:2567");
  // const client = new Colyseus.Client("ws://18.194.21.39:2567");
  const client = new Colyseus.Client("wss://scarmonger.xyz");

  // PIXI
  let app = {};
  let responsiveWidth = 0;
  let viewport = {};
  let loader = {};
  let ticker = {};

  // GAME LOOP
  const updatePositions = t => {
    // console.log(t);
    for (let key in moveQ) {
      if (localPlayers[key] && moveQ[key].length > 0) {
        let step = moveQ[key].shift();
        localPlayers[key].x = step.x;
        localPlayers[key].y = step.y;
      } else {
        if (key === $localUserSessionID) {
          inMotion = false;
          hideTarget()
          if(debug) hidePath()
        }
        delete moveQ[key];
        closePlayers = [];
        for (let k in localPlayers) {
          if (
            !localPlayers[k].isSelf &&
            Math.abs(localPlayers[k].x - localPlayers[$localUserSessionID].x) <
              200 &&
            Math.abs(localPlayers[k].y - localPlayers[$localUserSessionID].y) <
              200
          ) {
            closePlayers.push(localPlayers[k]);
          }
        }
      }
    }
  };

  const showTarget = (x, y) => {
    let graphics = new PIXI.Graphics();
    graphics.beginFill($localUserTint);
    graphics.alpha = 0.7;
    graphics.zIndex = 1;
    graphics.drawCircle(x, y, 32);
    graphics.endFill();
    viewport.addChild(graphics);
    targetGraphics = graphics
  };

  const hideTarget = () => {
      viewport.removeChild(targetGraphics);
      targetGraphics = {}
  };

  const showPath = path => {
    try {
      let line = new PIXI.Graphics();
      line.lineStyle(3, 0xFF0000, 0.6);
      line.moveTo(localPlayers[$localUserSessionID].x, localPlayers[$localUserSessionID].y);
      path.forEach(p => {
        line.lineTo(p.x, p.y);
      })
      viewport.addChild(line);
      pathGraphics = line
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const hidePath = () => {
    viewport.removeChild(pathGraphics);
    pathGraphics = {}
  };

  // FUNCTIONS
  let submitChat = () => {};

  const startPrivateChat = partner => {
    console.log(partner.id);
  };

  const makeNewUser = () => {
    loggedIn = true;
    gameContainer.appendChild(app.view);

    // LOADER
    loader
      .add("map", "hkw-map-no-house-smaller.png")
      .add("avatarOne", "avatar1.png")
      .add("avatarTwo", "avatar2.png")
      .add("avatarThree", "avatar3.png")
      .load((loader, resources) => {
        let map = new PIXI.Sprite(resources.map.texture);
        map.width = 5000;
        map.height = 5000;
        viewport.addChild(map);

        const avatarList = [
          resources.avatarOne.texture,
          resources.avatarTwo.texture,
          resources.avatarThree.texture
        ];

        let avatarIndex = sample([0, 1, 2]);

        // CREATE PLAYER
        const createPlayer = (player, sessionId) => {
          let avatar = new PIXI.Sprite(avatarList[player.avatar]);
          avatar.x = player.x;
          avatar.y = player.y;
          avatar.waypoints = [];
          avatar.area = player.area;
          avatar.anchor.set(0.5);
          avatar.scale.set(0.5);
          avatar.tint = player.tint;
          avatar.name = player.name;
          avatar.uuid = player.uuid;
          avatar.ip = player.ip;
          avatar.connected = player.connected;
          avatar.id = sessionId;
          avatar.zIndex = 10;
          avatar.isSelf = player.uuid == $localUserUUID;
          avatar.interactive = true;

          const onDown = e => {
            startPrivateChat(avatar);
            e.stopPropagation();
          }

          const onEnter = () => {
            popUpText = avatar.name;
          }

         const onLeave = () => {
            popUpText = false;
          }

          avatar.on("mousedown", onDown);
          avatar.on("touchstart", onDown);
          avatar.on("mouseover", onEnter);
          avatar.on("mouseout", onLeave);

          viewport.addChild(avatar);

          if (avatar.isSelf) {
            viewport.follow(avatar);
            userLoaded = true;
            localUserTint.set(avatar.tint);
            localUserName.set(avatar.name);
            localUserSessionID.set(avatar.id);
          }

          return avatar;
        };

        // ADD CASE STUDIES
        houseList.forEach(h => {
          let graphics = new PIXI.Graphics();
          graphics.beginFill(0xff0000);
          graphics.alpha = 1;
          graphics.drawRect(h.x, h.y, 140, 140);
          graphics.endFill();
          graphics.title = h.title;
          graphics.interactive = true;

          const onDown = e => {
            folderActive = graphics.title;
            e.stopPropagation();
          }

          const onEnter = e => {
            popUpText = graphics.title;
          }

          const onLeave = e => {
            popUpText = false;
          }

          graphics.on("mousedown", onDown);
          graphics.on("touchstart", onDown);
          graphics.on("mouseover", onEnter);
          graphics.on("mouseout", onLeave);

          viewport.addChild(graphics);
        });

        // => GAME ROOM
        client
          .joinOrCreate("game", {
            uuid: $localUserUUID,
            name: newUserName || chance.name(),
            avatar: avatarIndex,
            tint:
              newUserColor.replace("#", "0x").toUpperCase() ||
              chance
                .color({ format: "hex" })
                .replace("#", "0x")
                .toUpperCase()
          })
          .then(gameRoom => {
            // REMOVE
            gameRoom.state.players.onRemove = (player, sessionId) => {
              try {
                viewport.removeChild(localPlayers[sessionId]);
                delete localPlayers[sessionId];
                localPlayers = localPlayers;
              } catch (err) {
                Sentry.captureException(err);
              }
            };

            // ADD
            gameRoom.state.players.onAdd = (player, sessionId) => {
              localPlayers[sessionId] = createPlayer(player, sessionId);
            };

            // BANNED
            gameRoom.onMessage("banned", message => {
              banned = true;
            });

            // ILLEGAL MOVE
            gameRoom.onMessage("illegalMove", message => {
              hideTarget()
              inMotion = false;
            });

            // STATE CHANGE
            gameRoom.state.players.onChange = function(player, sessionId) {
              if (player.path.waypoints.length > 0) {
                if (localPlayers[sessionId].isSelf) {
                  localUserArea.set(player.area);
                  if(debug) showPath(player.path.waypoints)
                }
                moveQ[sessionId] = player.path.waypoints;
              }
            };

            // ERROR
            gameRoom.onError((code, message) => {
              console.error("!!! COLYSEUS ERROR:");
              console.error(message);
              Sentry.captureException(err);
            });

            // USER INTERACTION: CLICK / TAP
            viewport.on("clicked", e => {
              if (!inMotion) {
                gameRoom.send("go", {
                  x: Math.round(e.world.x),
                  y: Math.round(e.world.y)
                });

                inMotion = true;

                screenX = Math.round(e.screen.x);
                screenY = Math.round(e.screen.y);
                worldX = Math.round(e.world.x);
                worldY = Math.round(e.world.y);

                showTarget(Math.round(e.world.x), Math.round(e.world.y));
              }
            });
          })
          .catch(e => {
            if (e.code == 4215) {
              console.log('BANNED')
              banned = true;
            } else {
              console.log("GAME ROOM: JOIN ERROR", e);
              Sentry.captureException(e);
            }
          });

        // => CHAT ROOM
        client
          .joinOrCreate("chat")
          .then(chatRoom => {

            // ADD MESSAGE
            chatRoom.state.messages.onAdd = message => chatMessages = [...chatMessages, message];
            
            // REMOVE MESSAGE
            chatRoom.state.messages.onRemove = message => {
              try {
                const itemIndex = chatMessages.findIndex(m => m === message);
                chatMessages.splice(itemIndex, 1);
                chatMessages = chatMessages
              } catch (err) {
                Sentry.captureException(err);
              }
            }

            // ERROR
            chatRoom.onError((code, message) => {
              console.error(message);
              Sentry.captureException(message);
            });

            // SUBMIT CHAT
            submitChat = event => {
              chatRoom.send("submit", {
                msgId: chance.guid(),
                uuid: $localUserUUID,
                name: $localUserName,
                text: event.detail.text,
                tint: $localUserTint
              });
            };
          })
          .catch(e => {
            console.log("CHAT ROOM: JOIN ERROR", e);
            Sentry.captureException(e);
          });
      });
  };

  onMount(async () => {
    // PIXI: APP
    app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      resolution: 1
    });

    responsiveWidth = window.matchMedia("(max-width: 700px)").matches
      ? window.innerWidth
      : window.innerWidth - 420;

    // PIXI: VIEWPORT
    viewport = new Viewport({
      screenWidth: responsiveWidth,
      screenHeight: window.innerHeight,
      worldWidth: WIDTH,
      worldHeight: HEIGHT,
      interaction: app.renderer.plugins.interaction
    });

    // PIXI: LOADER
    loader = PIXI.Loader.shared;

    // PIXI: TICKER
    ticker = PIXI.Ticker.shared;

    app.stage.addChild(viewport);
    ticker.start();
    ticker.add(updatePositions);

    rendererHeight = app.screen.height;
    rendererWidth = app.screen.width;
    viewportHeight = viewport.screenHeight;
    viewportWidth = viewport.screenWidth;

    window.onresize = () => {
      responsiveWidth = window.matchMedia("(max-width: 700px)").matches
        ? window.innerWidth
        : window.innerWidth - 420;
      viewport.resize(responsiveWidth, window.innerHeight);
      app.renderer.resize(responsiveWidth, window.innerHeight);

      rendererHeight = app.screen.height;
      rendererWidth = app.screen.width;
      viewportHeight = viewport.screenHeight;
      viewportWidth = viewport.screenWidth;
    };

    window.dispatchEvent(new Event("resize"));

    if (window.matchMedia("(max-width: 700px)").matches) {
      viewport.setZoom(0.75);
    }

    if (!login) {
      makeNewUser();
    }
  });
</script>

<style lang="scss">
  @import "./variables.scss";

  * {
    box-sizing: border-box;
  }

  .game {
    width: calc(100vw - 420px);
    height: 100vh;
    position: fixed;
    top: 0;
    right: 0;
    overflow: hidden;
    float: right;
    opacity: 0;
    transition: opacity 1s ease-out;

    &.loaded {
      opacity: 1;
    }

    @include screen-size("small") {
      width: 100vw;
      right: 0;
    }
  }

  .account-overlay {
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
  }

  .account-box {
    background: #a4a4a4;
    width: 300px;
    padding: 20px;

    .header {
      font-weight: bold;
      margin-bottom: 20px;
    }

    input[type="text"] {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      background: $lightgrey;
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
      float: right;
      display: block;
      background: $darkgrey;
      padding: 10px;
      border: 0;
      outline: none;
      color: white;
      cursor: pointer;
      &:hover {
        background: $darkergrey;
      }
    }
  }

  .banned-overlay {
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
  }

  .banned-box {
    background: red;
    padding: 20px;
    font-size: 16vw;
    text-align: center;
    user-select: none;

    .header {
      font-weight: bold;
    }
  }

  .pop {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    right: 10px;
    padding: 20px;
    border-radius: 10px;

    @include screen-size("small") {
      top: unset;
      bottom: 20px;
    }

    &.tiny {
      border-radius: 5px;
      opacity: 0.7;
      padding: 5px;
      font-size: 10px;
      line-height: 1.2em;
      pointer-events: none;
    }
  }

  .proximity {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    bottom: 10px;
    left: 430px;
    padding: 20px;
    border-radius: 10px;
  }

  .folder {
    position: fixed;
    width: 400px;
    background: $grey;
    height: auto;
    line-height: 100px;
    text-align: center;
    top: 10px;
    right: 10px;
    padding: 20px;
    line-height: 1.4em;
    border-radius: 10px;
    cursor: pointer;

    p {
      text-align: left;
    }

    @include screen-size("small") {
      top: 20px;
      left: 20px;
      width: calc(100vw - 40px);
    }
  }

  .overlay {
    position: absolute;
    width: 5000px;
    height: 5000px;
    top: 0px;
    right: 0px;
    z-index: 1000;
    opacity: 0.3;
    pointer-events: none;
  }

  .phone-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 1000;
    padding: 10px;
    font-size: $font_size_small;
    text-align: center;
    display: none;

    @include screen-size("small") {
      display: block;
    }

    .chat-nav {
      border-radius: 10px;
      float: right;
      padding: 15px;
      background: $darkgrey;
      cursor: pointer;
      color: $lightergrey;
      &:active {
        background: $darkergrey;
      }
    }

    .userlist-nav {
      border-radius: 10px;
      float: left;
      padding: 15px;
      background: $darkgrey;
      cursor: pointer;
      color: $lightergrey;

      &:active {
        background: $darkergrey;
      }
    }
  }

  .current-area {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    bottom: 10px;
    right: 10px;
    padding: 20px;
    border-radius: 10px;
    @include screen-size("small") {
      top: unset;
      bottom: 20px;
      display: none;
    }
  }

  .stream-test {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    width: 360px;
    left: 430px;
    border-radius: 10px;
    @include screen-size("small") {
      display: none;
    }
  }
</style>

{#if banned}
  <div class="banned-overlay">
    <div class="banned-box">
      <div class="header">BANNED</div>
    </div>
  </div>
{/if}

{#if login && !loggedIn}
  <div class="account-overlay">
    <div class="account-box">
      <div class="header">Create session account</div>
      <input bind:value={newUserName} type="text" placeholder="Name" />
      <input bind:value={newUserColor} type="color" />
      <button on:click={makeNewUser}>Start</button>
    </div>
  </div>
{/if}

{#if position}
  <div class="pop" in:fade>Link to location. X: {x}, Y: {y}</div>
{/if}

<div class="phone-nav">
  <div
    class="userlist-nav"
    on:click={() => {
      showChat = false;
      showUserList = !showUserList;
    }}>
    USERLIST
  </div>
  <div
    class="chat-nav"
    on:click={() => {
      showUserList = false;
      showChat = !showChat;
    }}>
    CHAT
  </div>
</div>

<!-- USER LIST -->
<UserList playerList={localPlayers} phoneActive={showUserList} />

<!-- CHAT -->
<Chat {chatMessages} on:submit={submitChat} phoneActive={showChat} />

<!-- GAME WORLD -->
<div class="game" class:loaded={userLoaded} bind:this={gameContainer} />

<!-- POP UP -->
{#if popUpText && !folderActive}
  <div class="pop" in:fade>{popUpText}</div>
{/if}

{#if debug}
  <div class="pop tiny" in:fade>
    <div>
      <strong>Renderer width:</strong>
      {rendererWidth}
    </div>
    <div>
      <strong>Renderer Height:</strong>
      {rendererHeight}
    </div>
    <div>
      <strong>viewport width:</strong>
      {viewportWidth}
    </div>
    <div>
      <strong>viewport Height:</strong>
      {viewportHeight}
    </div>
    <div>
      <strong>Pixel ratio:</strong>
      {window.devicePixelRatio}
    </div>
    <div>
      <strong>World X:</strong>
      {worldX}
    </div>
    <div>
      <strong>World Y:</strong>
      {worldY}
    </div>
    <div>
      <strong>Screen X:</strong>
      {screenX}
    </div>
    <div>
      <strong>Screen Y:</strong>
      {screenY}
    </div>
  </div>
{/if}

<!-- FOLDER  -->
{#if folderActive}
  <div
    class="folder"
    transition:fly={{ y: 200 }}
    on:click={() => {
      folderActive = false;
    }}>
    <h2>{folderActive}</h2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam laoreet
      lobortis mi, non aliquet turpis congue in. Nullam luctus id mauris sed
      luctus. Etiam vitae libero tempus, hendrerit nisl eget, sagittis sem. Cras
      dictum vel orci eget mollis. Curabitur non gravida odio. Fusce egestas
      aliquet ipsum, nec rutrum nisi dictum vitae. Nulla feugiat viverra sem, a
      dapibus ex dictum id.
    </p>
  </div>
{/if}

{#if $localUserArea}
  <div class="current-area">
    Currently in
    <strong>{colorTrans[$localUserArea]}</strong>
    area
  </div>
{/if}

{#if $localUserArea === 2}
  <video
    class="stream-test"
    src="test.mp4"
    muted
    autoplay
    loop
    transition:fly={{ y: 200 }} />
{/if}

<!-- PROXIMITY -->
{#if closePlayers.length > 0}
  <div class="proximity" transition:fly={{ y: 200 }}>
    <div>
      <strong>Players nearby</strong>
    </div>
    {#each closePlayers as player}
      <div>{player.name}</div>
    {/each}
  </div>
{/if}
