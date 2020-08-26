<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP World View
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
  import Login from "./Login.svelte";
  import CaseStudy from "./CaseStudy.svelte";
  import Banned from "./Banned.svelte";
  import AudioChat from "./AudioChat.svelte";

  // STORES
  import {
    localUserUUID,
    localUserName,
    localUserTint,
    localUserSessionID,
    localUserArea,
    inPrivateChat
  } from "./stores.js";

  localUserUUID.set(chance.guid());

  // PROPS
  export let authenticate = false;
  export let login = false;
  export let debug = true;
  // export let position = false
  // export let x = 0
  // export let y = 0
  export let sso = false;
  export let sig = false;

  // GLOBAL
  import {
    caseStudyList,
    KEYBOARD,
    WIDTH,
    HEIGHT,
    colorTrans
  } from "./global.js";

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
  let playersInProximity = [];
  let newUserName = "";
  let newUserColor = "";
  let newUserAvatar = 1;
  let loggedIn = false;
  let userLoaded = false;
  let showUserList = false;
  let showChat = false;
  let banned = false;
  let inMotion = false;

  let caseStudyActive = false;
  let currentCaseStudy = {};

  let audioChatActive = false;

  let localPlayers = {};
  let chatMessages = [];
  let moveQ = [];

  let targetGraphics = {};
  let pathGraphics = {};

  // COLYSEUS
  // const client = new Colyseus.Client("ws://localhost:2567");
  // const client = new Colyseus.Client("ws://18.194.21.39:2567");
  const client = new Colyseus.Client("wss://gameserver.tsoap.dev");

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
          hideTarget();
          if (debug) hidePath();
        }
        delete moveQ[key];
        playersInProximity = [];
        for (let k in localPlayers) {
          if (
            !localPlayers[k].isSelf &&
            Math.abs(localPlayers[k].x - localPlayers[$localUserSessionID].x) <
              200 &&
            Math.abs(localPlayers[k].y - localPlayers[$localUserSessionID].y) <
              200
          ) {
            playersInProximity.push(localPlayers[k]);
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
    targetGraphics = graphics;
  };

  const hideTarget = () => {
    viewport.removeChild(targetGraphics);
    targetGraphics = {};
  };

  const showPath = path => {
    try {
      let line = new PIXI.Graphics();
      line.lineStyle(3, 0xff0000, 0.6);
      line.moveTo(
        localPlayers[$localUserSessionID].x,
        localPlayers[$localUserSessionID].y
      );
      path.forEach(p => {
        line.lineTo(p.x, p.y);
      });
      viewport.addChild(line);
      pathGraphics = line;
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const hidePath = () => {
    viewport.removeChild(pathGraphics);
    pathGraphics = {};
  };

  // FUNCTIONS
  let teleportTo = () => {};
  let submitChat = () => {};
  let startPrivateChat = () => {};
  let leavePrivateChat = () => {};

  const makeNewUser = (sso, sig) => {
    loggedIn = true;
    gameContainer.appendChild(app.view);

    // LOADER
    // http://localhost:5000/
    loader
      .add("map", "/hkw-map-no-house-smaller.png")
      .add("avatarOne", "/avatar1.png")
      .add("avatarTwo", "/avatar2.png")
      .add("avatarThree", "/avatar3.png")
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
          avatar.authenticated = player.authenticated;
          avatar.id = sessionId;
          avatar.zIndex = 10;
          avatar.isSelf = player.uuid == $localUserUUID;
          avatar.interactive = true;

          // console.dir(avatar.isSelf);

          const onDown = e => {
            startPrivateChat(avatar);
            e.stopPropagation();
          };

          const onEnter = () => {
            popUpText = avatar.name;
          };

          const onLeave = () => {
            popUpText = false;
          };

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
        caseStudyList.forEach((h, i) => {
          let graphics = new PIXI.Graphics();
          graphics.beginFill(0xff0000);
          graphics.alpha = 1;
          graphics.drawRect(h.x, h.y, 140, 140);
          graphics.endFill();
          graphics.title = h.title;
          graphics.index = i;
          graphics.interactive = true;

          const onDown = e => {
            caseStudyActive = true;
            currentCaseStudy = caseStudyList[graphics.index];
            e.stopPropagation();
          };

          const onEnter = e => {
            popUpText = graphics.title;
          };

          const onLeave = e => {
            popUpText = false;
          };

          graphics.on("mousedown", onDown);
          graphics.on("touchstart", onDown);
          graphics.on("mouseover", onEnter);
          graphics.on("mouseout", onLeave);

          viewport.addChild(graphics);
        });

        let playerObject = {};

        if (authenticate && sso && sig) {
          playerObject = {
            sso: sso,
            sig: sig,
            uuid: $localUserUUID,
            avatar: avatarIndex,
            tint:
              newUserColor.replace("#", "0x").toUpperCase() ||
              chance
                .color({ format: "hex" })
                .replace("#", "0x")
                .toUpperCase()
          };
        } else {
          playerObject = {
            uuid: $localUserUUID,
            name: newUserName || chance.name(),
            avatar: avatarIndex,
            tint:
              newUserColor.replace("#", "0x").toUpperCase() ||
              chance
                .color({ format: "hex" })
                .replace("#", "0x")
                .toUpperCase()
          };
        }

        // => GAME ROOM
        client
          .joinOrCreate("game", playerObject)
          .then(gameRoom => {
            // HACK
            history.replaceState({}, "CONNECTED", "/");

            // ******
            // PLAYER
            // ******

            // PLAYER: REMOVE
            gameRoom.state.players.onRemove = (player, sessionId) => {
              try {
                viewport.removeChild(localPlayers[sessionId]);
                delete localPlayers[sessionId];
                localPlayers = localPlayers;
              } catch (err) {
                Sentry.captureException(err);
              }
            };

            // PLAYER: ADD
            gameRoom.state.players.onAdd = (player, sessionId) => {
              // console.log('onAdd player')
              // console.dir(player)
              // console.log(sessionId);
              localPlayers[sessionId] = createPlayer(player, sessionId);
            };

            // PLAYER: BANNED
            gameRoom.onMessage("banned", message => {
              banned = true;
            });

            // PLAYER: ILLEGAL MOVE
            gameRoom.onMessage("illegalMove", message => {
              hideTarget();
              inMotion = false;
            });

            // PLAYER: STATE CHANGE
            gameRoom.state.players.onChange = function(player, sessionId) {
              // console.dir(localPlayers);
              // console.log(sessionId);
              if (player.path.waypoints.length > 0) {
                if (localPlayers[sessionId].isSelf) {
                  localUserArea.set(player.area);
                  if (debug) showPath(player.path.waypoints);
                }
                moveQ[sessionId] = player.path.waypoints;
              } else {
                // TELEPORT
                if (localPlayers[sessionId].isSelf) {
                  localUserArea.set(player.area);
                }
                localPlayers[sessionId].x = player.x;
                localPlayers[sessionId].y = player.y;

                playersInProximity = [];
                for (let k in localPlayers) {
                  if (
                    !localPlayers[k].isSelf &&
                    Math.abs(
                      localPlayers[k].x - localPlayers[$localUserSessionID].x
                    ) < 200 &&
                    Math.abs(
                      localPlayers[k].y - localPlayers[$localUserSessionID].y
                    ) < 200
                  ) {
                    playersInProximity.push(localPlayers[k]);
                  }
                }
              }
            };

            // PLAYER: CLICK / TAP
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

            // PLAYER: TELEPORT
            teleportTo = area => {
              // console.log(area)
              gameRoom.send("teleport", {
                area: area
              });
            };

            // *******
            // MESSAGE
            // *******

            // MESSAGE: ADD
            gameRoom.state.messages.onAdd = message => {
              chatMessages = [...chatMessages, message];
            };

            // MESSAGE: REMOVE
            gameRoom.state.messages.onRemove = message => {
              try {
                const itemIndex = chatMessages.findIndex(m => m === message);
                chatMessages.splice(itemIndex, 1);
                chatMessages = chatMessages;
              } catch (err) {
                Sentry.captureException(err);
              }
            };

            // MESSAGE: SUBMIT
            submitChat = event => {
              try {
                gameRoom.send("submitChatMessage", {
                  msgId: chance.guid(),
                  uuid: $localUserUUID,
                  name: $localUserName,
                  text: event.detail.text,
                  tint: $localUserTint
                });
              } catch (err) {
                Sentry.captureException(err);
              }
            };

            // ************
            // PRIVATE ROOM
            // ************

            // PRIVATE ROOM: START
            startPrivateChat = partner => {
              try {
                client.create("chat", { partner: partner.id }).then(r => {
                  gameRoom.send("createPrivateRoom", {
                    roomId: r.id,
                    partner: partner.id
                  });

                  inPrivateChat.set(true);

                  // PRIVATE ROOM: LEAVE
                  leavePrivateChat = () => {
                    r.leave();

                    gameRoom.send("leavePrivateRoom", {
                      roomId: r.id
                    });

                    inPrivateChat.set(false);
                  };
                });
              } catch (err) {
                Sentry.captureException(err);
              }
            };

            // PRIVATE ROOM: ADD
            gameRoom.state.privateRooms.onAdd = message => {
              // console.log('add private room')
              // console.dir(gameRoom.state.privateRooms)
              // console.dir(message)
            };

            // PRIVATE ROOM: REMOVE
            gameRoom.state.privateRooms.onRemove = message => {
              // console.log('remove private room')
              // console.dir(gameRoom.state.privateRooms)
            };

            // ************
            // GENERAL
            // ************

            // GENNERAL: ERROR
            gameRoom.onError((code, message) => {
              console.error("!!! COLYSEUS ERROR:");
              console.error(message);
              Sentry.captureException(err);
            });
          })
          .catch(e => {
            if (e.code == 4215) {
              console.log("BANNED");
              banned = true;
            } else {
              console.log("GAME ROOM: JOIN ERROR", e);
              Sentry.captureException(e);
            }
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
      makeNewUser(sso, sig);
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

  .pop {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 50px;
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

    &.tiny {
      border-radius: 5px;
      opacity: 0.7;
      // padding: 5px;
      font-size: 10px;
      line-height: 1.2em;
      pointer-events: none;
    }
  }

  .stream-test {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 50px;
    width: 360px;
    left: 430px;
    border-radius: 10px;
    @include screen-size("small") {
      display: none;
    }
  }

  .top-bar {
    position: fixed;
    top: 0%;
    right: 0;
    width: calc(100vw - 420px);
    height: 40px;
    background: #a4a4a4;
    padding: 10px;
    padding-top: 5px;
    overflow: scroll;
    font-size: 12px;
    z-index: 1000;
    user-select: none;

    @include screen-size("small") {
      display: none;
    }

    .link {
      text-decoration: none;
      font-weight: bold;
      height: 30px;
      line-height: 10px;
      padding: 10px;
      color: black;
      border-radius: 5px;
      text-align: center;
      display: block;
      float: left;
      margin-right: 5px;
      background: lightgray;

      &.audio-chat {
        float: right;
        background: #2e2e2e;
        color: white;
      }

      &.header {
        border: 1px solid lightgray;
        background: transparent;
      }

      &.green {
        background: #78f878;
      }
      &.blue {
        background: #7878f8;
      }
      &.yellow {
        background: #f8f878;
      }
      &.red {
        background: #f87878;
      }

      &.interact {
        border: none;
        opacity: 0.7;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .mainChatContainer {
    position: fixed;
    top: 50%;
    left: 0;
    width: 420px;
    height: 50vh;
    background: #a4a4a4;
    padding: 10px;
    overflow: scroll;
    font-size: 12px;
    z-index: 100;

    @include screen-size("small") {
      top: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5 ease-out;
      padding-top: 80px;

      &.phone {
        opacity: 1;
        pointer-events: all;
      }
    }
  }

  .privateChatContainer {
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
      height: 600px;
      position: relative;
      z-index: 1000;
    }
  }

  .mainUserListContainer {
    position: fixed;
    top: 0px;
    left: 0;
    width: 420px;
    height: 50vh;
    background: lightgray;
    padding: 10px;
    padding-top: 10px;
    overflow: scroll;
    padding-bottom: 200px;
    z-index: 100;

    @include screen-size("small") {
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5 ease-out;
      padding-top: 80px;

      &.phone {
        opacity: 1;
        pointer-events: all;
      }
    }
  }
</style>

<!-- TOP BAR -->
<div class="top-bar">
  <a class="interact link" href="login">Login</a>
  <div
    class="link interact green"
    on:click={() => {
      teleportTo('green');
    }}>
    GOTO: Green
  </div>
  <div
    class="link interact blue"
    on:click={() => {
      teleportTo('blue');
    }}>
    GOTO: Blue
  </div>
  <div
    class="link interact yellow"
    on:click={() => {
      teleportTo('yellow');
    }}>
    GOTO: Yellow
  </div>
  <div
    class="link interact red"
    on:click={() => {
      teleportTo('red');
    }}>
    GOTO: Red
  </div>

  <div
    class="link audio-chat interact"
    on:click={() => {
      audioChatActive = true;
    }}>
    ~ ~ Test audio chat ~ ~
  </div>
</div>

{#if banned}
  <Banned />
{/if}

{#if login && !loggedIn}
  <Login
    {sso}
    {sig}
    on:newTemporaryUser={e => {
      console.dir(e);
      newUserName = e.detail.newUserName;
      newUserColor = e.detail.newUserColor;
      loggedIn = true;
      makeNewUser();
    }} />
{/if}

<!-- AUDIO CHAT -->
{#if audioChatActive}
  <AudioChat
    name={$localUserName}
    on:close={e => {
      audioChatActive = false;
    }} />
{/if}

<!-- PHONE NAVIGATION -->
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
<div class="mainUserListContainer" class:phone={showUserList}>
  <UserList playerList={localPlayers} phoneActive={showUserList} />
</div>

<!-- CHAT -->
<div class="mainChatContainer" class:phone={showChat}>
  <Chat {chatMessages} on:submit={submitChat} phoneActive={showChat} />
</div>

<!-- PRIVATE CHAT -->
{#if $inPrivateChat}
  <div transition:fade class="privateChatContainer" on:click={leavePrivateChat}>
    <div class="box">
      <Chat {chatMessages} on:submit={submitChat} />
    </div>
  </div>
{/if}

<!-- GAME WORLD -->
<div class="game" class:loaded={userLoaded} bind:this={gameContainer} />

<!-- POP UP -->
{#if popUpText && !caseStudyActive}
  <div class="pop" in:fade>{popUpText}</div>
{/if}

<!-- FOLDER  -->
{#if caseStudyActive}
  <CaseStudy
    caseStudy={currentCaseStudy}
    on:closeCaseStudy={e => {
      caseStudyActive = false;
    }} />
{/if}

<!-- CURRENT AREA BOX -->
{#if $localUserArea}
  <div class="current-area tiny">
    Currently in
    <strong>{colorTrans[$localUserArea]}</strong>
    area
  </div>
{/if}

<!-- STREAM TEST -->
{#if $localUserArea === 2}
  <video
    class="stream-test"
    src="/test.mp4"
    muted
    autoplay
    loop
    transition:fly={{ y: 200 }} />
{/if}

<!-- PROXIMITY -->
{#if playersInProximity.length > 0}
  <div class="proximity" transition:fly={{ y: 200 }}>
    <div>
      <strong>Players nearby</strong>
    </div>
    {#each playersInProximity as player}
      <div>
        {player.name}
        <button
          on:click={e => {
            startPrivateChat(player);
          }}>
          Start chat
        </button>
      </div>
    {/each}
  </div>
{/if}

<!-- DEBUG -->
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
