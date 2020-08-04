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
  import Hammer from "hammerjs";
  import Chance from "chance";
  import { fade, fly } from "svelte/transition";
  const chance = new Chance();

  // STORES
  import { localUser, localUserTint } from "./stores.js";
  localUser.set(chance.guid());

  // GLOBAL
  import { houseList, KEYBOARD, WIDTH, HEIGHT } from "./global.js";

  // COMPONENTS
  import Chat from "./Chat.svelte";
  import UserList from "./UserList.svelte";

  // DOM REFERENCES
  let gameContainer = {};

  // VARIABLES
  let popUpText = false;
  let folderActive = false;
  let closePlayers = [];
  let newUserName = "";
  let newUserColor = "";
  let loggedIn = false;
  let localPlayers = [];
  let chatMessages = [];
  let userLoaded = false;
  let showUserList = false;
  let showChat = false;

  // COLYSEUS
  // const client = new Colyseus.Client("ws://localhost:2567");
  const client = new Colyseus.Client("ws://18.194.21.39:2567");

  // PIXI: APP
  const app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    transparent: true
  });

  let responsiveWidth = window.matchMedia("(max-width: 700px)").matches
    ? window.innerWidth
    : window.innerWidth - 420;

  // PIXI: VIEWPORT
  let viewport = new Viewport({
    screenWidth: responsiveWidth,
    screenHeight: window.innerHeight,
    worldWidth: WIDTH,
    worldHeight: HEIGHT,
    interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  });

  // PIXI: LOADER
  const loader = PIXI.Loader.shared; // PixiJS exposes a premade instance for you to use.

  // PIXI: TICKER
  const ticker = PIXI.Ticker.shared;

  // GAME LOOP
  const updatePositions = () => {
    for (let i = 0; i < localPlayers.length; i++) {
      if (localPlayers[i].waypoints.length > 0) {
        let step = localPlayers[i].waypoints.shift();
        localPlayers[i].x = step.x;
        localPlayers[i].y = step.y;
      }
    }
  };

  const showTarget = (x, y) => {
    let graphics = new PIXI.Graphics();
    graphics.beginFill($localUserTint);
    graphics.alpha = 0.7;
    graphics.zIndex = 1;
    graphics.drawCircle(x, y, 32); // drawCircle(x, y, radius)
    graphics.endFill();
    viewport.addChild(graphics);

    // HACK
    setTimeout(() => {
      viewport.removeChild(graphics);
    }, 1000);
  };

  // FUNCTIONS
  let submitChat = () => {};

  const makeNewUser = () => {
    loggedIn = true;

    gameContainer.appendChild(app.view);

    // LOADER
    loader
      .add("map", "hkw-map-no-house.png")
      .add("avatar", "avatar.png")
      .load((loader, resources) => {
        // Add map to viewport
        let map = new PIXI.Sprite(resources.map.texture);
        viewport.addChild(map);

        // CREATE PLAYER
        const createPlayer = (player, i) => {
          let avatar = new PIXI.Sprite(resources.avatar.texture);

          console.dir(avatar);
          avatar.x = player.x;
          avatar.y = player.y;
          avatar.waypoints = [];
          avatar.anchor.set(0.5);
          avatar.scale.set(0.2);
          avatar.tint = player.tint;
          avatar.name = player.name;
          avatar.uuid = player.uuid;
          avatar.id = i;
          avatar.zIndex = 10;
          avatar.isSelf = player.uuid == $localUser;
          avatar.interactive = true;
          avatar.on("mousedown", onDown);
          avatar.on("touchstart", onDown);
          avatar.on("mouseover", onEnter);
          avatar.on("mouseout", onLeave);

          function onDown(e) {
            // console.dir(e);
            // console.log(avatar.name);
            e.data.originalEvent.preventDefault();
            e.data.originalEvent.stopPropagation(); // here ! not work
          }

          function onEnter(e) {
            popUpText = avatar.name;
          }

          function onLeave(e) {
            popUpText = false;
          }

          // Add the avatar to the scene we are building
          // app.stage.addChild(avatar);
          viewport.addChild(avatar);

          if (avatar.isSelf) {
            viewport.follow(avatar);
            userLoaded = true;
            localUserTint.set(avatar.tint);
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
          graphics.on("mousedown", onDown);
          graphics.on("touchstart", onDown);
          graphics.on("mouseover", onEnter);
          graphics.on("mouseout", onLeave);

          function onDown(e) {
            // console.log("house");
            // console.dir(e);
            folderActive = graphics.title;
            e.data.originalEvent.preventDefault();
            e.data.originalEvent.stopPropagation(); // here ! not work
          }

          function onEnter(e) {
            popUpText = graphics.title;
          }

          function onLeave(e) {
            popUpText = false;
          }

          viewport.addChild(graphics);
        });

        // => GAME ROOM
        client
          .joinOrCreate("game", {
            uuid: $localUser,
            name: newUserName || chance.name(),
            tint:
              newUserColor.replace("#", "0x").toUpperCase() ||
              chance
                .color({ format: "hex" })
                .replace("#", "0x")
                .toUpperCase()
          })
          .then(gameRoom => {
            // REMOVE
            gameRoom.state.players.onRemove = function(player, i) {
              viewport.removeChild(localPlayers.find(obj => obj.id === i));
              localPlayers = localPlayers.filter(obj => obj.id !== i);
            };

            // ADD
            gameRoom.state.players.onAdd = function(player, i) {
              localPlayers = [createPlayer(player, i), ...localPlayers];
            };

            // STATE CHANGE
            gameRoom.onStateChange(state => {
              for (let key in state.players) {
                const player = state.players[key];
                const index = localPlayers.findIndex(p => p.id === key);
                localPlayers[index].waypoints = player.path.waypoints;
              }
            });

            // ERROR
            gameRoom.onError((code, message) => {
              console.error("!!! COLYSEUS ERROR:");
              console.error(message);
            });

            // USER INTERACTION: CLICK / TAP
            viewport.on("clicked", e => {
              gameRoom.send("go", {
                x: Math.round(e.world.x),
                y: Math.round(e.world.y)
              });
              showTarget(Math.round(e.world.x), Math.round(e.world.y));
            });
          })
          .catch(e => {
            console.log("GAME ROOM: JOIN ERROR", e);
          });

        // => CHAT ROOM
        client
          .joinOrCreate("chat")
          .then(chatRoom => {
            // CHANGE
            chatRoom.onStateChange(state => {
              chatMessages = state.messages;
            });

            // ERROR
            chatRoom.onError((code, message) => {
              console.error(message);
            });

            // SUBMIT CHAT
            submitChat = event => {
              chatRoom.send("submit", {
                msgId: chance.guid(),
                uuid: $localUser,
                name: localPlayers.find(p => p.isSelf).name,
                text: event.detail.text,
                tint: localPlayers.find(p => p.isSelf).tint
              });
            };
          })
          .catch(e => {
            console.log("CHAT ROOM: JOIN ERROR", e);
          });
      });
  };

  onMount(async () => {
    console.dir(viewport);
    app.stage.addChild(viewport);
    ticker.start();
    ticker.add(updatePositions);

    // viewport
    //   .clampZoom({ minScale: 0.5, maxScale: 1.5 })
    //   .wheel()
    //   .pinch();

    if (window.matchMedia("(max-width: 700px)").matches) {
      viewport.setZoom(0.75);
    }

    makeNewUser();
  });
</script>

<style lang="scss" global>
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
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100000;
  }

  .account-box {
    background: white;
    width: 300px;
    padding: 20px;
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
  }

  .proximity {
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
  }

  .folder {
    position: fixed;
    width: 400px;
    background: $grey;
    height: calc(100vh - 80px);
    line-height: 100px;
    text-align: center;
    top: 20px;
    right: 20px;
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
      height: calc(100vh - 40px);
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
      // border-bottom: 1px solid $lightergrey;

      &:active {
        background: $darkergrey;
      }
    }
  }
</style>

{#if !loggedIn}
  <div class="account-overlay">
    <div class="account-box">
      <input bind:value={newUserName} type="text" placeholder="Name" />
      <input bind:value={newUserColor} type="color" />
      <button on:click={makeNewUser}>Start</button>
    </div>
  </div>
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

<!-- PROXIMITY -->
<!-- {#if closePlayers.length > 0}
  <div class="proximity" transition:fly={{ y: 200 }}>
    <div>
      <strong>Players nearby</strong>
    </div>
    {#each closePlayers as player}
      <div>{player.name}</div>
    {/each}
  </div>
{/if} -->
