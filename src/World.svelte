<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP World View
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { onMount } from "svelte"
  import * as Colyseus from "colyseus.js"
  import * as PIXI from "pixi.js"
  // import * as PIXI from "./pixi.js"
  import { Viewport } from "pixi-viewport"
  import get from "lodash/get"
  import sample from "lodash/sample"
  import { fade, fly, scale } from "svelte/transition"
  import { urlFor, loadData, renderBlockText } from "./sanity.js"
  import { links, navigate } from "svelte-routing"

  // COMPONENTS
  import Chat from "./Chat.svelte"
  import Login from "./Login.svelte"
  import CaseStudySingle from "./CaseStudySingle.svelte"
  import UserProfileSingle from "./UserProfileSingle.svelte"
  import CaseStudyListing from "./CaseStudyListing.svelte"
  import Calendar from "./Calendar.svelte"
  import EventSingle from "./EventSingle.svelte"
  import Banned from "./Banned.svelte"
  import LoadingScreen from "./LoadingScreen.svelte"
  import Error from "./Error.svelte"
  import AudioChat from "./AudioChat.svelte"

  // Set the name of the hidden property and the change event for visibility
  let hidden, visibilityChange
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden"
    visibilityChange = "visibilitychange"
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden"
    visibilityChange = "msvisibilitychange"
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden"
    visibilityChange = "webkitvisibilitychange"
  }

  let deltaJump = 0
  let hiddenTime = 0

  const handleVisibilityChange = () => {
    if (document[hidden]) {
      hiddenTime = Date.now()
    } else {
      deltaJump = Math.round((Date.now() - hiddenTime) / 16.6666)
    }
  }

  document.addEventListener(visibilityChange, handleVisibilityChange, false)

  // PROPS
  export let authenticate = false
  export let sso = false
  export let sig = false
  export let params = false
  // export let slug = false

  let section = false
  let slug = false

  $: {
    // Split URL parameters
    // console.log("* * * * * ")
    // console.log("PARAMS UPDATED")
    // console.log("– params", params)
    const args = get(params, "[*]", "").split("/")
    section = args[0] && args[0].length > 0 ? args[0] : "seed"
    slug = args[1] && args[1].length > 0 ? args[1] : false
    // console.log("– section", section)
    // console.log("– slug", slug)
    // console.log("* * * * * ")
  }

  // GLOBAL
  import {
    nanoid,
    getRandomInt,
    KEYBOARD,
    MAP,
    COLORMAP,
    QUERY,
    AREA,
    TEXT_STYLE,
  } from "./global.js"

  // STORES
  import { localUserUUID, localUserSessionID } from "./stores.js"

  // ** SANITY
  const graphicsSettings = loadData(QUERY.GRAPHICS_SETTINGS)
  const events = loadData(QUERY.EVENTS)
  const caseStudies = loadData(QUERY.CASE_STUDIES)
  const landMarks = loadData(QUERY.LAND_MARKS)
  const users = loadData(QUERY.USERS)

  users.then((users) => {
    console.dir(users)
  })

  // Promise.allSettled([graphicsSettings, events, caseStudies, landMarks]).catch(
  //   (err) => {
  //     console.log("ASDASDASDASDAS")
  //   }
  // )
  // DOM REFERENCES
  let gameContainer = {}

  // VARIABLES

  const STATE = {
    ERROR: 0,
    READY: 1,
    LOADING: 2,
    LOGIN: 3,
    CASE_STUDY_SINGLE: 4,
    CASE_STUDY_LISTING: 5,
    EVENT_SINGLE: 6,
    USER_PROFILE_SINGLE: 7,
    BANNED: 8,
  }

  // UI STATE
  const UI = { state: STATE.LOADING, slug: false, errorMessage: false }

  const setUIState = (newState, newSlug = false, errorMessage = false) => {
    switch (newState) {
      case STATE.READY:
        UI.state = STATE.READY
        UI.slug = false
        history.pushState({}, "", "/")
        break
      case STATE.LOGIN:
        UI.state = STATE.LOGIN
        UI.slug = false
        history.pushState({}, "", "/login")
        break
      case STATE.CASE_STUDY_SINGLE:
        UI.state = STATE.CASE_STUDY_SINGLE
        UI.slug = newSlug
        history.pushState({}, "", "/case-studies/" + UI.slug)
        break
      case STATE.CASE_STUDY_LISTING:
        UI.state = STATE.CASE_STUDY_LISTING
        UI.slug = false
        history.pushState({}, "", "/case-studies/")
        break
      case STATE.EVENT_SINGLE:
        UI.state = STATE.EVENT_SINGLE
        UI.slug = newSlug
        history.pushState({}, "", "/events/" + UI.slug)
        break
      case STATE.USER_PROFILE_SINGLE:
        UI.state = STATE.USER_PROFILE_SINGLE
        UI.slug = newSlug
        history.pushState({}, "", "/profile/" + UI.slug)
        break
      case STATE.LOADING:
        UI.state = STATE.LOADING
        UI.slug = false
        history.pushState({}, "", "/")
        break
      case STATE.BANNED:
        UI.state = STATE.BANNED
        UI.slug = false
        history.pushState({}, "", "/banned")
        break
      default:
        UI.state = STATE.ERROR
        UI.slug = false
        UI.errorMessage = errorMessage
        history.pushState({}, "", "/error/")
    }
  }

  $: {
    console.log("STATE: ", UI.state)
  }

  let activeContentClosed = false
  let audioChatActive = false
  let sidebarHidden = false
  let loggedIn = false

  // UI DATA VARIABLES
  let miniImage = false

  // WORLD STATE
  let playersInProximity = []
  let localPlayers = {}
  let chatMessages = []
  let moveQ = []

  // COLYSEUS
  // const client = new Colyseus.Client("ws://localhost:2567")
  // const client = new Colyseus.Client("ws://212.36.170.236:2567")
  const client = new Colyseus.Client("wss://gameserver.tsoap.dev")

  // PIXI
  let app = {}
  let viewport = {}
  let ticker = {}
  let avatarSpritesheets = {}

  // PIXI LAYERS
  let mapLayer = {}
  let caseStudyLayer = {}
  let playerLayer = {}
  let landMarkLayer = {}

  // PIXI MISC.
  let targetGraphics = {}

  const checkPlayerProximity = () => {
    playersInProximity = []
    for (let k in localPlayers) {
      if (
        !localPlayers[k].isSelf &&
        Math.abs(
          localPlayers[k].avatar.x - localPlayers[$localUserSessionID].avatar.x
        ) < 200 &&
        Math.abs(
          localPlayers[k].avatar.y - localPlayers[$localUserSessionID].avatar.y
        ) < 200
      ) {
        playersInProximity.push(localPlayers[k])
      }
    }
  }

  // GAME LOOP
  const updatePositions = (delta) => {
    let deltaRounded = Math.round(delta) + deltaJump
    deltaJump = 0
    for (let key in moveQ) {
      if (localPlayers[key]) {
        if (moveQ[key].length > 0) {
          if (moveQ[key].length - deltaRounded < 0) {
            let step = moveQ[key][moveQ[key].length - 1]
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            localPlayers[key].area = step.area
            moveQ[key] = []
          } else {
            moveQ[key].splice(0, deltaRounded - 1)
            let step = moveQ[key].shift()
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            localPlayers[key].area = step.area
          }
        } else {
          localPlayers[key].avatar.setAnimation("rest")
          if (key === $localUserSessionID) {
            // hideTarget()
          }
          delete moveQ[key]
          checkPlayerProximity()
        }
      } else {
        delete moveQ[key]
      }
    }
  }

  const showTarget = (x, y) => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(0xff0000)
    graphics.alpha = 0.8
    graphics.drawCircle(x, y, 10)
    graphics.endFill()
    viewport.addChild(graphics)
    targetGraphics = graphics
  }

  const hideTarget = () => {
    viewport.removeChild(targetGraphics)
    targetGraphics = {}
  }

  // FUNCTIONS
  let teleportTo = () => {}
  let submitChat = () => {}

  const makeNewUser = (sso, sig) => {
    loggedIn = true
    gameContainer.appendChild(app.view)

    // Load assets
    graphicsSettings.then((graphicsSettings) => {
      // Load map
      const mapAsset = get(graphicsSettings, "mapLink.mainImage.asset", false)
      if (mapAsset) {
        const mapLoader = new PIXI.Loader()
        const mapUrl = urlFor(mapAsset).url()
        miniImage = urlFor(graphicsSettings.mapLink.miniImage.asset)
          .width(400)
          .height(400)
          .quality(100)
          .auto("format")
          .url()
        mapLoader.add("map", mapUrl)
        mapLoader.load((loader, resources) => {
          const map = new PIXI.Sprite(resources.map.texture)
          map.width = MAP.WIDTH
          map.height = MAP.HEIGHT
          mapLayer.addChild(map)
        })
      } else {
        setUIState(STATE.ERROR, false, "Unable to load map")
        throw "Unable to load map"
      }

      // Load avatars
      const activeAvatars = get(graphicsSettings, "activeAvatars", false)
      const avatarLoader = new PIXI.Loader()
      if (activeAvatars && activeAvatars.length > 0) {
        activeAvatars.forEach((avatar, index) => {
          const spriteUrl = get(avatar, "spriteJsonURL", false)
          if (spriteUrl) {
            avatarLoader.add(avatar._id, spriteUrl)
          }
        })
      } else {
        setUIState(STATE.ERROR, false, "Unable to load avatars")
        throw "Unable to load avatars"
      }

      avatarLoader.load((loader, resources) => {
        for (let key of Object.keys(resources)) {
          if (resources[key].extension === "json") {
            avatarSpritesheets[key] = resources[key].spritesheet
          }
        }

        // CREATE PLAYER
        const createPlayer = (playerOptions, sessionId) => {
          console.log("playerOptions", playerOptions)
          const sprites = ["rest", "front", "back", "left", "right"].map(
            (ms) => {
              const sprite = new PIXI.AnimatedSprite(
                avatarSpritesheets[playerOptions.avatar].animations[ms]
              )
              sprite.name = ms
              sprite.visible = ms === "rest" ? true : false
              sprite.height = 60
              sprite.width = 60
              sprite.animationSpeed = ms === "rest" ? 0.02 : 0.1
              sprite.play()
              return sprite
            }
          )

          console.log(playerOptions.name)
          const nameText = new PIXI.Text(playerOptions.name, TEXT_STYLE)
          nameText.anchor.set(0.5)

          const avatar = new PIXI.Container()
          avatar.addChild(...sprites)
          avatar.motionState = "rest"
          avatar.setAnimation = (direction) => {
            avatar.motionState = direction
            avatar.children.forEach((c) => {
              c.visible = c.name == direction ? true : false
            })
          }
          avatar.x = playerOptions.x
          avatar.y = playerOptions.y
          avatar.pivot.x = avatar.width / 2
          avatar.pivot.y = avatar.height / 2
          avatar.interactive = true

          const player = {
            avatar: avatar,
            waypoints: [],
            area: playerOptions.area,
            name: playerOptions.name,
            uuid: playerOptions.uuid,
            ip: playerOptions.ip,
            tint: playerOptions.tint,
            connected: playerOptions.connected,
            authenticated: playerOptions.authenticated,
            id: sessionId,
            isSelf: playerOptions.uuid === $localUserUUID,
          }

          const onDown = (e) => {
            e.stopPropagation()
          }

          const onEnter = () => {
            // console.log("nameText.width", nameText.width)
            // console.log("nameText.height", nameText.height)
            nameText.x = avatar.x + 10
            nameText.y = avatar.y - 40
            playerLayer.addChild(nameText)
          }

          const onLeave = () => {
            playerLayer.removeChild(nameText)
          }

          player.avatar.on("mousedown", onDown)
          player.avatar.on("touchstart", onDown)
          player.avatar.on("mouseover", onEnter)
          player.avatar.on("mouseout", onLeave)

          playerLayer.addChild(player.avatar)

          if (player.isSelf) {
            viewport.follow(player.avatar)
            localUserSessionID.set(player.id)
            switch (section) {
              case "case-studies":
                if (slug) {
                  setUIState(STATE.CASE_STUDY_SINGLE, slug)
                  break
                }
                setUIState(STATE.CASE_STUDY_LISTING)
                break
              case "profile":
                if (slug) {
                  setUIState(STATE.USER_PROFILE_SINGLE, slug)
                  break
                }
                break
              case "events":
                if (slug) {
                  setUIState(STATE.EVENT_SINGLE, slug)
                  break
                }
              default:
                setUIState(STATE.READY)
            }
          }

          return player
        }

        let randomAvatar = sample(Object.keys(avatarSpritesheets))

        let name = graphicsSettings.activeAvatars.find(
          (a) => a._id === randomAvatar
        ).title

        let playerObject = {}

        if (authenticate && sso && sig) {
          playerObject = {
            sso: sso,
            sig: sig,
            uuid: $localUserUUID,
            avatar: randomAvatar,
            tint: "0xffff00",
          }
        } else {
          playerObject = {
            uuid: $localUserUUID,
            name: name,
            avatar: randomAvatar,
            tint: "0xff0000",
          }
        }

        // => GAME ROOM
        client
          .joinOrCreate("game", playerObject)
          .then((gameRoom) => {
            // HACK
            if (authenticate) {
              history.replaceState({}, "CONNECTED", "/")
            }

            // ******
            // PLAYER
            // ******

            // PLAYER: REMOVE
            gameRoom.state.players.onRemove = (player, sessionId) => {
              try {
                playerLayer.removeChild(localPlayers[sessionId].avatar)
                // HACK
                setTimeout(() => {
                  delete localPlayers[sessionId]
                  localPlayers = localPlayers
                }, 500)
              } catch (err) {
                setUIState(STATE.ERROR, false, err)
                console.dir(err)
              }
            }

            // PLAYER: ADD
            gameRoom.state.players.onAdd = (player, sessionId) => {
              console.dir(player)
              localPlayers[sessionId] = createPlayer(player, sessionId)
            }

            // PLAYER: BANNED
            gameRoom.onMessage("banned", (message) => {
              setUIState(STATE.BANNED)
            })

            // PLAYER: ILLEGAL MOVE
            gameRoom.onMessage("illegalMove", (message) => {
              // hideTarget()
            })

            // PLAYER: STATE CHANGE
            gameRoom.state.players.onChange = (player, sessionId) => {
              if (player.path.waypoints.length > 0) {
                moveQ[sessionId] = player.path.waypoints
              } else {
                // TELEPORT
                localPlayers[sessionId].area = player.area
                localPlayers[sessionId].avatar.x = player.x
                localPlayers[sessionId].avatar.y = player.y
                checkPlayerProximity()
              }
            }

            // PLAYER: CLICK / TAP
            viewport.on("clicked", (e) => {
              // hideTarget()
              gameRoom.send("go", {
                x: Math.round(e.world.x),
                y: Math.round(e.world.y),
                originX: localPlayers[$localUserSessionID].avatar.x,
                originY: localPlayers[$localUserSessionID].avatar.y,
              })
              // showTarget(Math.round(e.world.x), Math.round(e.world.y))
            })

            // PLAYER: TELEPORT
            teleportTo = (area) => {
              gameRoom.send("teleport", {
                area: area,
              })
            }

            // *******
            // MESSAGE
            // *******

            // MESSAGE: ADD
            gameRoom.state.messages.onAdd = (message) => {
              chatMessages = [...chatMessages, message]
            }

            // MESSAGE: REMOVE
            gameRoom.state.messages.onRemove = (message) => {
              try {
                const itemIndex = chatMessages.findIndex((m) => m === message)
                chatMessages.splice(itemIndex, 1)
                chatMessages = chatMessages
              } catch (err) {
                setUIState(STATE.ERROR, false, err)
                console.dir(err)
              }
            }

            // MESSAGE: SUBMIT
            submitChat = (event) => {
              try {
                gameRoom.send("submitChatMessage", {
                  msgId: nanoid(),
                  uuid: $localUserUUID,
                  name: localPlayers[$localUserSessionID].name,
                  text: event.detail.text,
                  area: localPlayers[$localUserSessionID].area,
                  tint: localPlayers[$localUserSessionID].tint,
                })
              } catch (err) {
                setUIState(STATE.ERROR, false, err)
                console.dir(err)
              }
            }

            // ************
            // CASE STUUDIES
            // ************

            // CREATE CASE STUDY
            const createCaseStudy = (caseStudy) => {
              const nameText = new PIXI.Text(caseStudy.name, TEXT_STYLE)
              nameText.anchor.set(0.5)

              const graphics = new PIXI.Graphics()
              graphics.beginFill(caseStudy.tint)
              graphics.alpha = caseStudy.carriedBy === "" ? 1 : 0
              graphics.drawRect(caseStudy.x, caseStudy.y, 30, 30)
              graphics.endFill()
              graphics.interactive = true

              const onDown = (e) => {
                gameRoom.send("pickUpCaseStudy", {
                  uuid: caseStudy.uuid,
                })
                e.stopPropagation()
              }

              const onEnter = () => {
                nameText.x = caseStudy.x + 10
                nameText.y = caseStudy.y - 30
                viewport.addChild(nameText)
              }

              const onLeave = () => {
                viewport.removeChild(nameText)
              }

              graphics.on("mousedown", onDown)
              graphics.on("touchstart", onDown)
              graphics.on("mouseover", onEnter)
              graphics.on("mouseout", onLeave)

              viewport.addChild(graphics)
            }

            // CASE STUDY: ADD
            gameRoom.state.caseStudies.onAdd = (caseStudy, sessionId) => {
              // console.dir(caseStudy)
              createCaseStudy(caseStudy)
            }

            // CASE STUDY: REMOVE
            gameRoom.state.caseStudies.onRemove = (caseStudy, sessionId) => {
              console.dir(caseStudy)
              // createCaseStudy(caseStudy)
            }

            // CASE STUDY: STATE CHANGE
            gameRoom.state.caseStudies.onChange = (caseStudy, sessionId) => {
              console.log("---- case study state change")
              console.log(caseStudy.uuid)
              console.dir(caseStudy)
            }

            // ************
            // GENERAL
            // ************

            // GENERAL: ERROR
            gameRoom.onError((code, message) => {
              setUIState(STATE.ERROR, false, message)
              console.error("!!! COLYSEUS ERROR:")
              console.error(message)
              console.dir(err)
            })
          })
          .catch((e) => {
            if (e.code == 4215) {
              console.log("BANNED")
              setUIState(STATE.BANNED)
            } else {
              console.log("GAME ROOM: JOIN ERROR", e)
              setUIState(STATE.ERROR, false, "FAILED TO CONNECT TO GAMESERVER")
              // Sentry.captureException(err)
            }
          })
      })

      // ADD CASE STUDIES
      caseStudies.then((caseStudies) => {
        caseStudies.forEach((cs, i) => {
          const spriteUrl = get(cs, "spriteLink.spriteJsonURL", "")
          const spriteId = "caseStudy-" + cs._id
          const csLoader = new PIXI.Loader()
          csLoader.add(spriteId, spriteUrl).load((loader, resources) => {
            const frames = new PIXI.AnimatedSprite(
              resources[spriteId].spritesheet.animations["frames"]
            )
            frames.animationSpeed = 0.02
            frames.play()

            const nameText = new PIXI.Text(cs.title, TEXT_STYLE)
            nameText.anchor.set(0.5)

            const caseStudyLocation = new PIXI.Container()
            caseStudyLocation.addChild(frames)
            caseStudyLocation.x = cs.x
            caseStudyLocation.y = cs.y
            caseStudyLocation.pivot.x = caseStudyLocation.width / 2
            caseStudyLocation.pivot.y = caseStudyLocation.height / 2
            caseStudyLocation.title = cs.title
            caseStudyLocation.interactive = true

            const onDown = (e) => {
              const csSlug = get(cs, "slug.current", false)
              csSlug
                ? setUIState(STATE.CASE_STUDY_SINGLE, csSlug)
                : setUIState(STATE.CASE_STUDY_LISTING)
              e.stopPropagation()
            }

            const onEnter = (e) => {
              gameContainer.style.cursor = "pointer"
              nameText.x = caseStudyLocation.x + 10
              nameText.y = caseStudyLocation.y - 60
              caseStudyLayer.addChild(nameText)
            }

            const onLeave = (e) => {
              gameContainer.style.cursor = "default"
              caseStudyLayer.removeChild(nameText)
            }

            caseStudyLocation.on("mousedown", onDown)
            caseStudyLocation.on("touchstart", onDown)
            caseStudyLocation.on("mouseover", onEnter)
            caseStudyLocation.on("mouseout", onLeave)

            caseStudyLayer.addChild(caseStudyLocation)
          })
        })
      })

      // ADD LANDMARKS
      landMarks.then((landMarks) => {
        landMarks.forEach((lm, i) => {
          const spriteUrl = get(lm, "spriteJsonURL", "")
          const spriteId = "landMark-" + lm._id
          const lmLoader = new PIXI.Loader()

          lmLoader.add(spriteId, spriteUrl).load((loader, resources) => {
            const frames = new PIXI.AnimatedSprite(
              resources[spriteId].spritesheet.animations["frames"]
            )
            // frames.visible = true
            frames.animationSpeed = 0.02
            frames.play()

            const landMarkLocation = new PIXI.Container()
            landMarkLocation.addChild(frames)
            landMarkLocation.x = lm.x
            landMarkLocation.y = lm.y
            landMarkLocation.pivot.x = landMarkLocation.width / 2
            landMarkLocation.pivot.y = landMarkLocation.height / 2

            landMarkLayer.addChild(landMarkLocation)
          })
        })
      })
    })
  }

  onMount(async () => {
    // GLOBAL SCALE MODE SETTING
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    // PIXI: APP
    app = new PIXI.Application({
      width: MAP.WIDTH,
      height: MAP.HEIGHT,
      resolution: 1,
    })

    const getResponsiveWidth = () =>
      window.matchMedia("(max-width: 700px)").matches || sidebarHidden
        ? window.innerWidth
        : window.innerWidth - 400

    // PIXI: VIEWPORT
    viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: MAP.WIDTH,
      worldHeight: MAP.HEIGHT,
      interaction: app.renderer.plugins.interaction,
    })

    app.stage.addChild(viewport)

    // Create and add layers
    mapLayer = new PIXI.Container()
    caseStudyLayer = new PIXI.Container()
    playerLayer = new PIXI.Container()
    landMarkLayer = new PIXI.Container()
    viewport.addChild(mapLayer)
    viewport.addChild(caseStudyLayer)
    viewport.addChild(playerLayer)
    viewport.addChild(landMarkLayer)

    // PIXI: TICKER
    ticker = PIXI.Ticker.shared
    ticker.start()
    ticker.add(updatePositions)

    window.onresize = () => {
      const responsiveWidth = getResponsiveWidth()
      viewport.resize(responsiveWidth, window.innerHeight)
      app.renderer.resize(responsiveWidth, window.innerHeight)
    }

    window.dispatchEvent(new Event("resize"))

    if (window.matchMedia("(max-width: 700px)").matches) {
      viewport.setZoom(0.75)
    }

    // Give the local user a UUID
    localUserUUID.set(nanoid())

    console.log("CHECKING URL PARAMS ====>")
    console.log("section", section)
    console.log("slug", slug)

    if (section === "login") {
      console.log("LOGIN")
      setUIState(STATE.LOGIN)
    } else {
      makeNewUser(sso, sig)
    }
  })
</script>

<style lang="scss">
  @import "./variables.scss";

  * {
    box-sizing: border-box;
    font-family: $mono-stack;
  }

  .pop {
    position: fixed;
    width: auto;
    background: $COLOR_MID_2;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    right: 410px;
    padding: 20px;
    border-radius: 10px;

    @include screen-size("small") {
      top: unset;
      bottom: 20px;
    }

    &.waypoint {
      top: unset;
      bottom: 50px;
      right: 410px;
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
    font-size: $FONT_SIZE_BASE;
    position: fixed;
    width: auto;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    bottom: 10px;
    left: 10px;
    padding: 20px;
    border-radius: 10px;
  }

  .current-area {
    position: fixed;
    width: auto;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    left: 10px;
    padding: 10px;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    @include screen-size("small") {
      top: unset;
      bottom: 20px;
      display: none;
    }
  }

  .game {
    width: calc(100vw - 400px);
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    opacity: 1;
    transition: opacity 1s ease-out;

    @include screen-size("small") {
      width: 100vw;
      right: 0;
    }

    &.expanded {
      width: 100vw;
    }
  }

  .hide-button {
    position: fixed;
    top: 10px;
    right: 350px;
    width: 40px;
    height: 40px;
    line-height: 36px;
    font-size: 22px;
    text-align: center;
    border-radius: 20px;
    color: $COLOR_MID_2;
    background: $COLOR_LIGHT;
    user-select: none;
    cursor: pointer;
    transition: background 0.3s $transition;
    z-index: 1000;

    &:hover {
      background: $COLOR_MID_1;
    }
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: $SIDEBAR_WIDTH;
    height: 100vh;
    padding: 0;
    overflow: hidden;
    z-index: 100;
    transform: translateX(0);
    transition: transform 0.5s $transition;

    // HEIGHTS:
    // Minimap => 200px
    // Calendar =>
    // Chat =>
    // Menubar => 60px

    .minimap {
      background: black;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      // @include screen-size("short") {
      //   height: 150px;
      // }

      .map-container {
        height: 200px;
        width: 200px;
        position: relative;

        // @include screen-size("short") {
        //   transform: scale(0.5);
        // }

        img {
          height: 200px;
          width: 200px;
        }

        .map-marker {
          height: 10px;
          width: 10px;
          border-radius: 5px;
          background: white;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
        }
      }
    }

    .menu {
      height: 40px;
      color: $COLOR_DARK;
      font-size: $FONT_SIZE_BASE;
      background: $COLOR_LIGHT;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      user-select: none;

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

    .middle-section {
      height: calc(100% - 240px);
      background: red;

      .calendar {
        height: 50%;
        overflow: hidden;
        @include hide-scroll;
        // @include screen-size("short") {
        //   height: calc(50% - 65px);
        // }
      }

      .chat {
        background: $COLOR_DARK;
        height: 50%;
        @include hide-scroll;
        // @include screen-size("short") {
        //   height: calc(50% - 65px);
        // }
      }
    }

    &.hidden {
      transform: translateX(360px);
      cursor: pointer;
    }

    @include screen-size("small") {
      display: none;
    }
  }

  .passive-content-slot {
    position: fixed;
    bottom: 10px;
    right: 410px;
    width: 500px;
    height: calc(100vh - 330px);
    padding: 10px;
    background: $COLOR_MID_1;
    z-index: 100;
    overflow-y: auto;
    font-size: $FONT_SIZE_BASE;
    color: $COLOR_DARK;
    padding-bottom: 60px;
    border-radius: 4px;

    @include hide-scroll;

    @include screen-size("small") {
      display: none;
    }

    .close {
      margin-bottom: 20px;
      position: absolute;
      top: 0px;
      right: 10px;
      font-size: 48px;
      color: black;
      cursor: pointer;

      &:hover {
        transform: scale(1.2);
      }
    }
  }

  .active-content-slot {
    background: $COLOR_MID_1;
    z-index: 100;
    font-size: $FONT_SIZE_BASE;
    color: $COLOR_DARK;
    position: fixed;
    line-height: 2em;
    top: 10px;
    width: 500px;
    height: 300px;
    right: 410px;
    border-radius: 4px;

    @include screen-size("small") {
      display: none;
    }

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @include screen-size("small") {
      display: none;
    }

    .close {
      margin-bottom: 20px;
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 48px;
      color: black;
      cursor: pointer;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
</style>

{#if !sidebarHidden}
  <div
    class="hide-button"
    in:scale={{ delay: 500 }}
    on:click={() => {
      sidebarHidden = !sidebarHidden
      window.dispatchEvent(new Event('resize'))
    }}>
    »
  </div>
{/if}

<!-- SIDEBAR -->
{#if localPlayers[$localUserSessionID]}
  <div
    class="sidebar"
    use:links
    class:hidden={sidebarHidden}
    on:click={() => {
      if (sidebarHidden) {
        sidebarHidden = false
        window.dispatchEvent(new Event('resize'))
      }
    }}>
    <!-- MINIMAP -->
    <div class="minimap">
      <div class="map-container">
        {#if miniImage}<img src={miniImage} />{/if}
        {#if get(localPlayers[$localUserSessionID], 'avatar.y', false)}
          <div
            class="map-marker"
            style={'top: ' + Math.round(localPlayers[$localUserSessionID].avatar.y / 20 - 5) + 'px; left: ' + Math.round(localPlayers[$localUserSessionID].avatar.x / 20 - 5) + 'px;'} />
        {/if}
      </div>
    </div>
    <div class="middle-section">
      <!-- CALENDAR -->
      <div class="calendar">
        {#await events then events}
          <Calendar
            {events}
            on:goToEvent={(e) => {
              setUIState(STATE.EVENT_SINGLE, e.detail.slug)
            }} />
        {/await}
      </div>
      <!-- CHAT -->
      <div class="chat">
        <!-- localPlayers[$localUserSessionID].area -->
        {#if localPlayers[$localUserSessionID].area === AREA.GREEN}
          <Chat
            chatMessages={chatMessages.filter((m) => m.area === AREA.GREEN)}
            currentArea={AREA.GREEN}
            roomName="green"
            on:submit={submitChat} />
        {/if}
        {#if localPlayers[$localUserSessionID].area === AREA.YELLOW}
          <Chat
            chatMessages={chatMessages.filter((m) => m.area === AREA.YELLOW)}
            currentArea={AREA.YELLOW}
            roomName="yellow"
            on:submit={submitChat} />
        {/if}
        {#if localPlayers[$localUserSessionID].area === AREA.RED}
          <Chat
            chatMessages={chatMessages.filter((m) => m.area === AREA.RED)}
            currentArea={AREA.RED}
            roomName="red"
            on:submit={submitChat} />
        {/if}
        {#if localPlayers[$localUserSessionID].area === AREA.BLUE}
          <Chat
            chatMessages={chatMessages.filter((m) => m.area === AREA.BLUE)}
            currentArea={AREA.BLUE}
            roomName="blue"
            on:submit={submitChat} />
        {/if}
      </div>
    </div>
    <!-- MENUBAR -->
    <div class="menu">
      <div>
        <div
          class="menu-item"
          on:click={() => {
            setUIState(STATE.CASE_STUDY_LISTING)
          }}>
          Case-Studies
        </div>
        <div class="menu-item">About</div>
        <div class="menu-item">Help</div>
      </div>
      <div
        class="menu-item login"
        on:click={() => {
          setUIState(STATE.LOGIN)
        }}>
        Login
      </div>
    </div>
  </div>
{/if}

<!-- GAME WORLD -->
<div class="game" class:expanded={sidebarHidden} bind:this={gameContainer} />

<!-- CASE STUDIES -->
{#await caseStudies then caseStudies}
  {#if UI.state == STATE.CASE_STUDY_SINGLE || UI.state == STATE.CASE_STUDY_LISTING}
    <div class="passive-content-slot" transition:fly={{ y: 200 }}>
      <div
        class="close"
        on:click={(e) => {
          setUIState(STATE.READY)
        }}>
        ×
      </div>

      <!-- SINGLE CASE STUDY -->
      {#if UI.state == STATE.CASE_STUDY_SINGLE}
        <CaseStudySingle
          caseStudy={caseStudies.find((cs) => cs.slug.current === UI.slug)} />
      {/if}

      <!-- CASE STUDY LISTING -->
      {#if UI.state == STATE.CASE_STUDY_LISTING}
        <CaseStudyListing
          {caseStudies}
          on:goToSingle={(e) => {
            setUIState(STATE.CASE_STUDY_SINGLE, e.detail.slug)
          }} />
      {/if}
    </div>
  {/if}
{/await}

<!-- EVENTS -->
{#await events then events}
  {#if UI.state == STATE.EVENT_SINGLE}
    <div
      class="passive-content-slot"
      in:fly={{ y: 200, duration: 300 }}
      out:fly={{ y: 200, duration: 300 }}>
      <div
        class="close"
        on:click={(e) => {
          setUIState(STATE.READY)
        }}>
        ×
      </div>
      <!-- SINGLE EVENT -->
      <EventSingle event={events.find((ev) => ev.slug.current === UI.slug)} />
    </div>
  {/if}
{/await}

<!-- USERS -->
{#await users then users}
  {#if UI.state == STATE.USER_PROFILE_SINGLE}
    <div
      class="passive-content-slot"
      in:fly={{ y: 200, duration: 300 }}
      out:fly={{ y: 200, duration: 300 }}>
      <div
        class="close"
        on:click={(e) => {
          setUIState(STATE.READY)
        }}>
        ×
      </div>
      <!-- SINGLE EVENT -->
      <UserProfileSingle user={users.find((u) => u.slug.current === UI.slug)} />
    </div>
  {/if}
{/await}

<!-- ACTIVE CONTENT: STREAM -->
<!-- {#if $localUserArea === 4 && !activeContentClosed}
  <div class="active-content-slot" transition:fly={{ y: -200 }}>
    <video src="/test.mp4" muted autoplay loop />
    <div
      class="close"
      on:click={(e) => {
        activeContentClosed = true
      }}>
      ×
    </div>
  </div>
{/if} -->

<!-- PROXIMITY -->
{#if playersInProximity.length > 0}
  <div class="proximity" transition:fly={{ y: 200 }}>
    <div><strong>Players nearby</strong></div>
    {#each playersInProximity as player}
      <div>{player.name}</div>
    {/each}
  </div>
{/if}

<!-- CURRENT AREA BOX -->
{#if localPlayers[$localUserSessionID] && localPlayers[$localUserSessionID].area}
  <div class="current-area tiny">
    Currently in <strong>{COLORMAP[localPlayers[$localUserSessionID].area]}</strong>
    area
    <div>Users in area:</div>
    {#each Object.values(localPlayers).filter((p) => p.area === localPlayers[$localUserSessionID].area && p.uuid != $localUserUUID) as player}
      <div>{player.name}</div>
    {/each}
    <div class="button">Join audioroom</div>
  </div>
{/if}

<!-- AUDIO CHAT -->
{#if audioChatActive}
  <AudioChat
    name={localPlayers[$localUserSessionID].name}
    on:close={(e) => {
      audioChatActive = false
    }} />
{/if}

<!-- LOGIN -->
{#if UI.state == STATE.LOGIN}
  <Login
    {sso}
    {sig}
    on:newTemporaryUser={(e) => {
      console.dir(e)
      newUserName = e.detail.newUserName
      newUserColor = e.detail.newUserColor
      loggedIn = true
      makeNewUser()
    }} />
{/if}

<!-- BANNED -->
{#if UI.state == STATE.BANNED}
  <Banned />
{/if}

<!-- LOADING -->
{#if UI.state == STATE.LOADING}
  <LoadingScreen />
{/if}

<!-- ERROR -->
{#if UI.state == STATE.ERROR}
  <Error message={UI.errorMessage} />
{/if}
