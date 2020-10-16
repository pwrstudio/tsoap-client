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
  import { Viewport } from "pixi-viewport"
  import get from "lodash/get"
  import sample from "lodash/sample"
  import { fly, scale } from "svelte/transition"
  import { quartOut } from "svelte/easing"
  import { urlFor, loadData, client, renderBlockText } from "./sanity.js"
  import { links, navigate } from "svelte-routing"
  import { Howl } from "howler"
  import MediaQuery from "svelte-media-query"
  import Tweener from "tweener"
  import Cookies from "js-cookie"
  import slugify from "slugify"

  // *** COMPONENTS
  // sidebar
  import Chat from "./sidebar/Chat.svelte"
  import MiniMap from "./sidebar/MiniMap.svelte"
  import Menu from "./sidebar/Menu.svelte"
  import ToolBar from "./sidebar/ToolBar.svelte"
  import Seminar from "./sidebar/Seminar.svelte"
  import Messaging from "./sidebar/Messaging.svelte"
  // lists
  import EventList from "./lists/EventList.svelte"
  import EventListFull from "./lists/EventListFull.svelte"
  import CaseStudyList from "./lists/CaseStudyList.svelte"
  // singles
  import CaseStudySingle from "./singles/CaseStudySingle.svelte"
  import PageSingle from "./singles/PageSingle.svelte"
  import UserProfileSingle from "./singles/UserProfileSingle.svelte"
  import EventSingle from "./singles/event/EventSingle.svelte"
  import LiveSingle from "./singles/event/LiveSingle.svelte"
  import AudioInstallationSingle from "./singles/AudioInstallationSingle.svelte"
  // overlays
  import LoadingScreen from "./overlays/LoadingScreen.svelte"
  import Error from "./overlays/Error.svelte"
  // ...
  import AudioChat from "./AudioChat.svelte"
  import InventoryMessage from "./InventoryMessage.svelte"
  import MetaData from "./MetaData.svelte"

  // *** GLOBAL
  import {
    nanoid,
    MAP,
    COLORMAP,
    TINTMAP,
    QUERY,
    AREA,
    TEXT_ROOMS,
    VIDEO_ROOMS,
    AUDIO_ROOMS,
    TEXT_STYLE_AVATAR,
    TEXT_STYLE_AVATAR_AUTHENTICATED,
    TEXT_STYLE_CASE_STUDY,
  } from "./global.js"

  // *** STORES
  import {
    localUserUUID,
    localUserSessionID,
    localUserAuthenticated,
    authenticatedUserInformation,
    globalSettings,
    areaList,
    currentArea,
    currentTextRoom,
    currentAudioRoom,
    currentVideoRoom,
    currentAreaObject,
  } from "./stores.js"

  // *** PROPS
  export let params = false

  // DOM REFERENCES
  let gameContainer = {}

  // VARIABLES
  let activeContentClosed = false
  let audioChatActive = false
  let sidebarHidden = false
  let caseStudiesLoaded = false
  let intentToPickUp = false
  let inAudioZone = false
  let mobileExpanded = false
  let miniImage = false
  let showWelcomeCard = false
  let localPlayers = {}
  let chatMessages = []
  let moveQ = []

  // ___ Routing
  let section = false
  let slug = false
  let sso = false
  let sig = false
  let returnSection = false
  let returnSlug = false

  $: {
    // ___ Split the url parameter into variables
    const args = get(params, "[*]", "").split("/")
    section = args[0] && args[0].length > 0 ? args[0] : "seed"
    if (section === "authenticate") {
      sso = args[1] && args[1].length > 0 ? args[1] : false
      sig = args[2] && args[2].length > 0 ? args[2] : false
      returnSection = args[3] && args[3].length > 0 ? args[3] : false
      returnSlug = args[4] && args[4].length > 0 ? args[4] : false
    } else {
      slug = args[1] && args[1].length > 0 ? args[1] : false
    }
  }

  // ___ Listen for changes to page visibility (ie. tab being out of focus etc..)
  // ___ Fastforward animations when window is refocused
  let deltaJump = 0
  let hiddenTime = 0
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

  const handleVisibilityChange = () => {
    if (document[hidden]) {
      hiddenTime = Date.now()
    } else {
      // Number of frames missed (1000ms / 60frames ≈ 16.6666)
      deltaJump = Math.round((Date.now() - hiddenTime) / 16.6666)
    }
  }

  document.addEventListener(visibilityChange, handleVisibilityChange, false)

  // ___ Get data from Sanity CMS
  const graphicsSettings = loadData(QUERY.GRAPHICS_SETTINGS).catch(err => {
    console.log(err)
  })
  const events = loadData(QUERY.EVENTS).catch(err => {
    console.log(err)
  })
  const caseStudies = loadData(QUERY.CASE_STUDIES).catch(err => {
    console.log(err)
  })
  const audioInstallations = loadData(QUERY.AUDIO_INSTALLATIONS).catch(err => {
    console.log(err)
  })
  const landMarks = loadData(QUERY.LAND_MARKS).catch(err => {
    console.log(err)
  })
  const users = loadData(QUERY.USERS).catch(err => {
    console.log(err)
  })
  const pages = loadData(QUERY.PAGES).catch(err => {
    console.log(err)
  })
  const welcomeCard = loadData(QUERY.WELCOME_CARD).catch(err => {
    console.log(err)
  })

  loadData(QUERY.GLOBAL_SETTINGS)
    .then(gS => {
      // console.log("globalSettings", gS)
      globalSettings.set(gS)
    })
    .catch(err => {
      console.log(err)
    })

  loadData(QUERY.AREAS)
    .then(areas => {
      // console.log("areas", areas)
      areaList.set(areas)
    })
    .catch(err => {
      console.log(err)
    })

  // __ Listen for changes to the active streams post
  let activeStreams = loadData(QUERY.ACTIVE_STREAMS).catch(err => {
    console.log(err)
  })
  let currentStream = false

  client.listen(QUERY.ACTIVE_STREAMS).subscribe(update => {
    currentStream = false
    setTimeout(() => {
      activeStreams = loadData(QUERY.ACTIVE_STREAMS)
        .then(aS => {
          if (aS.mainStream) {
            currentStream = aS.mainStream
            activeContentClosed = false
          } else {
            currentStream = false
          }
        })
        .catch(err => {
          console.log(err)
        })
    }, 1000)
  })

  activeStreams.then(activeStreams => {
    currentStream = activeStreams.mainStream
  })

  // ___ Set overarching state of the UI
  const STATE = {
    ERROR: 0,
    READY: 1,
    LOADING: 2,
  }

  const UI = { state: STATE.LOADING, errorMessage: false }

  const setUIState = (newState, errorMessage = false) => {
    switch (newState) {
      case STATE.READY:
        UI.state = STATE.READY
        break
      case STATE.LOADING:
        UI.state = STATE.LOADING
        break
      default:
        UI.state = STATE.ERROR
        UI.errorMessage = errorMessage
    }
  }

  // __ Connect to Colyseus gameserver
  const gameClient = new Colyseus.Client("wss://gameserver.tsoap.dev")
  // const client = new Colyseus.Client("ws://localhost:2567")

  // ___ For animations
  const tweener = new Tweener(1 / 60)

  // PIXI
  let app = {}
  let viewport = {}
  let ticker = {}
  let avatarSpritesheets = {}
  // layers
  let mapLayer = {}
  let emergentLayer = {}
  let exhibitionLayer = {}
  let audioInstallationLayer = {}
  let playerLayer = {}
  let landMarkLayer = {}
  // misc
  let targetGraphics = {}

  const checkAudioProximity = () => {
    audioInstallationLayer.children.forEach(a => {
      // Get distance between user and audio installation
      const dist = Math.sqrt(
        Math.pow(a.x - localPlayers[$localUserSessionID].avatar.x, 2) +
          Math.pow(a.y - localPlayers[$localUserSessionID].avatar.y, 2)
      )
      // Check if user is within range of audio installation
      if (dist < a.radius) {
        if (!a.audio.playing() && !a.noAutoplay) {
          a.audio.play()
          inAudioZone = a.slug
        }
        // Set volume proportionally to distance
        // Formula to translate ranges:
        // NewValue = ((OldValue - OldMin) * NewRange) / OldRange + NewMin;
        a.audio.volume(1 - dist / a.radius)
      }
      if (dist > a.radius) {
        if (a.audio.playing()) {
          a.audio.pause()
          inAudioZone = false
        }
      }
    })
  }

  // __ Game loop
  // __ Called at approximately 60fps by pixi.ticker
  const updatePositions = delta => {
    // Combine delta (lag) and potential time passed since window was in focus
    let deltaRounded = Math.round(delta) + deltaJump
    deltaJump = 0
    // Iterate over all users currently in move queue
    for (let key in moveQ) {
      if (localPlayers[key]) {
        if (moveQ[key].length > 0) {
          if (moveQ[key].length - deltaRounded < 0) {
            // User reached destination while the window was out of focus
            // Move to final step and clear users's move queue
            let step = moveQ[key][moveQ[key].length - 1]
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            localPlayers[key].area = step.area
            moveQ[key] = []
          } else {
            // Get next step, adjusting for delta
            moveQ[key].splice(0, deltaRounded - 1)
            let step = moveQ[key].shift()
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            localPlayers[key].area = step.area
            if (key === $localUserSessionID && moveQ[key].length % 10 === 0) {
              // Set current area for users
              currentArea.set(localPlayers[$localUserSessionID].area)
              // Check proximity to audio installations every 10th step
              checkAudioProximity()
            }
          }
        } else {
          // Destination reached
          if (key === $localUserSessionID) {
            hideTarget()
            // User was walking towards a case study
            if (intentToPickUp) {
              pickUpCaseStudy(intentToPickUp)
            }
          }
          localPlayers[key].avatar.setAnimation("rest")
          delete moveQ[key]
        }
      } else {
        delete moveQ[key]
      }
    }
  }

  // __ Mark path destination
  const showTarget = (x, y) => {
    const graphics = new PIXI.Graphics()
    graphics.beginFill(0xffffff)
    graphics.alpha = 0.5
    graphics.drawCircle(x, y, 10)
    graphics.endFill()
    mapLayer.addChild(graphics)
    targetGraphics = graphics
  }

  const hideTarget = () => {
    mapLayer.removeChild(targetGraphics)
    targetGraphics = {}
  }

  // *** GLOBAL FUNCTIONS
  let teleportTo = () => {}
  let submitChat = () => {}
  let dropCaseStudy = () => {}
  let pickUpCaseStudy = () => {}

  const initializeGameWorld = (sso, sig) => {
    // __ Load assets
    graphicsSettings.then(graphicsSettings => {
      // __ Load map
      const mapAsset = get(graphicsSettings, "mapLink.mainImage.asset", false)
      if (mapAsset) {
        // __ Get minimap URL
        miniImage = urlFor(graphicsSettings.mapLink.miniImage.asset)
          .width(400)
          .height(400)
          .quality(100)
          .auto("format")
          .url()
        // __ Load main map
        const mapLoader = new PIXI.Loader()
        const mapUrl = urlFor(mapAsset).url()
        mapLoader.add("map", mapUrl)
        mapLoader.load((loader, resources) => {
          const map = new PIXI.Sprite(resources.map.texture)
          map.width = MAP.WIDTH
          map.height = MAP.HEIGHT
          mapLayer.addChild(map)
        })
      } else {
        setUIState(STATE.ERROR, "Unable to load map")
        throw "Unable to load map"
      }

      // __ Load avatars
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
        setUIState(STATE.ERROR, "Unable to load avatars")
        throw "Unable to load avatars"
      }
      avatarLoader.load((loader, resources) => {
        for (let key of Object.keys(resources)) {
          if (resources[key].extension === "json") {
            avatarSpritesheets[key] = resources[key].spritesheet
          }
        }

        // __ Create player
        const createPlayer = (playerOptions, sessionId) => {
          // __ Create sprites for all motion states
          const sprites = ["rest", "front", "back", "left", "right"].map(ms => {
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
          })

          // __ Name graphics (shown on hover)
          const textSprite = new PIXI.Text(
            playerOptions.name,
            playerOptions.authenticated
              ? TEXT_STYLE_AVATAR_AUTHENTICATED
              : TEXT_STYLE_AVATAR
          )
          const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE)
          txtBG.width = textSprite.width + 10
          txtBG.height = textSprite.height + 10
          textSprite.x = 5
          textSprite.y = 5
          const textContainer = new PIXI.Container()
          textContainer.addChild(txtBG, textSprite)
          textContainer.name = "text"

          // __ Add sprites and initial position to container
          const avatar = new PIXI.Container()
          avatar.addChild(...sprites)
          avatar.motionState = "rest"
          avatar.x = playerOptions.x
          avatar.y = playerOptions.y
          avatar.pivot.x = avatar.width / 2
          avatar.pivot.y = avatar.height / 2
          avatar.interactive = true
          avatar.setAnimation = direction => {
            avatar.motionState = direction
            avatar.children.forEach(c => {
              c.visible = c.name == direction || c.name == "text" ? true : false
            })
          }

          const player = {
            avatar: avatar,
            waypoints: [],
            area: playerOptions.area,
            name: playerOptions.name,
            discourseName: playerOptions.discourseName,
            uuid: playerOptions.uuid,
            ip: playerOptions.ip,
            tint: playerOptions.tint,
            connected: playerOptions.connected,
            authenticated: playerOptions.authenticated,
            id: sessionId,
            isSelf: playerOptions.uuid === $localUserUUID,
          }

          const onDown = e => {
            // __ Open profile if accredited user
            if (player.authenticated) {
              navigate(
                "/profiles/" +
                  slugify(player.discourseName, {
                    lower: true,
                    strict: true,
                  })
              )
            }
            if (player.uuid != $localUserUUID) {
              e.stopPropagation()
            }
          }

          const onEnter = () => {
            if (player.authenticated) {
              gameContainer.style.cursor = "pointer"
            }
            textContainer.y = 30 - textContainer.height / 2
            textContainer.x = -(textContainer.width / 2) + 30
            avatar.addChild(textContainer)
          }

          const onLeave = () => {
            gameContainer.style.cursor = "crosshair"
            avatar.removeChild(textContainer)
          }

          player.avatar.on("mousedown", onDown)
          player.avatar.on("touchstart", onDown)
          player.avatar.on("mouseover", onEnter)
          player.avatar.on("mouseout", onLeave)

          playerLayer.addChild(player.avatar)

          if (player.isSelf) {
            // __ Follow own avatar in viewport
            viewport.follow(player.avatar, {
              radius: 20,
              acceleration: 400,
            })
            localUserSessionID.set(player.id)
            // __ Uncomment this line to show the accredited user toolkit while developing...
            // localUserAuthenticated.set(true)

            // __ Set cookie if user is successfully authenticated
            if (player.authenticated) {
              Cookies.set("tsoap-logged-in", "true", { expires: 7 })
              localUserAuthenticated.set(true)
              loadData(QUERY.AUTH_USER_INFO, {
                username: player.discourseName,
              })
                .then(info => {
                  authenticatedUserInformation.set(info)
                })
                .catch(err => {
                  console.log(err)
                })
              // __ Navigate based on URL paramters passed
              // __ before going through authenticateion
              let returnPath = "/"
              returnPath += returnSection ? returnSection : ""
              returnPath += returnSlug ? "/" + returnSlug : ""
              navigate(returnPath)
            }
            // __ Loading is done
            setUIState(STATE.READY)
          }

          return player
        }

        console.log("___YYY RANDOM")
        console.dir(activeAvatars)
        // __ Get a random avatar
        const randomAvatar = sample(activeAvatars.filter(a => !a.notRandom))

        console.log(randomAvatar)

        let playerObject = {}

        if (section === "authenticate" && sso && sig) {
          playerObject = {
            sso: sso,
            sig: sig,
            uuid: $localUserUUID,
            tint: "0xffff00",
          }
        } else {
          playerObject = {
            uuid: $localUserUUID,
            name: randomAvatar.title,
            avatar: randomAvatar._id,
            tint: "0xff0000",
          }
        }

        // __ Join game room
        gameClient
          .joinOrCreate("game", playerObject)
          .then(gameRoom => {
            // ******
            // PLAYER
            // ******

            // PLAYER => REMOVE
            gameRoom.state.players.onRemove = (player, sessionId) => {
              try {
                if (get(localPlayers, "[sessionId].avatar", false)) {
                  // Remove player graphics
                  playerLayer.removeChild(localPlayers[sessionId].avatar)
                  // !!! HACK
                  setTimeout(() => {
                    // Delete player object
                    delete localPlayers[sessionId]
                    localPlayers = localPlayers
                  }, 500)
                }
              } catch (err) {
                setUIState(STATE.ERROR, err)
                console.dir(err)
              }
            }

            // PLAYER => ADD
            gameRoom.state.players.onAdd = (player, sessionId) => {
              localPlayers[sessionId] = createPlayer(player, sessionId)
            }

            // PLAYER => BANNED
            gameRoom.onMessage("banned", message => {
              setUIState(STATE.ERROR, "You have been banned")
            })

            // PLAYER => ILLEGAL MOVE
            gameRoom.onMessage("illegalMove", message => {
              const initialX = localPlayers[$localUserSessionID].avatar.x
              // __ Vibrate avatar
              tweener
                .add(localPlayers[$localUserSessionID].avatar)
                .to(
                  {
                    x: initialX + 10,
                  },
                  0.05
                )
                .to(
                  {
                    x: initialX - 10,
                  },
                  0.1
                )
                .to(
                  {
                    x: initialX,
                  },
                  0.05
                )
              hideTarget()
            })

            // PLAYER => CHANGE
            gameRoom.state.players.onChange = (player, sessionId) => {
              if ($localUserSessionID === sessionId) {
                localPlayers[sessionId].carrying = player.carrying
                // __ Carrying ?
                if (localPlayers[sessionId].carrying && intentToPickUp) {
                  let g = emergentLayer.children.find(
                    cs => cs.uuid === player.carrying
                  )
                  navigate("/case-studies/" + g.slug)
                  intentToPickUp = false
                }
              }
              if (player.path.waypoints.length > 0) {
                // __ Normal movement
                moveQ[sessionId] = player.path.waypoints
              } else {
                // __ Teleport
                localPlayers[sessionId].area = player.area
                localPlayers[sessionId].avatar.x = player.x
                localPlayers[sessionId].avatar.y = player.y
                if ($localUserSessionID === sessionId) {
                  currentArea.set(localPlayers[sessionId].area)
                }
              }
            }

            // PLAYER => CLICK / TAP
            viewport.on("clicked", e => {
              // __ Cancel current movement
              delete moveQ[$localUserSessionID]
              hideTarget()
              // __ Start new movement
              const targetX = Math.round(e.world.x)
              const targetY = Math.round(e.world.y)
              showTarget(targetX, targetY)
              gameRoom.send("go", {
                x: targetX,
                y: targetY,
                originX: localPlayers[$localUserSessionID].avatar.x,
                originY: localPlayers[$localUserSessionID].avatar.y,
              })
            })

            // PLAYER => TOUCH END
            viewport.on("touchend", e => {
              // __ Convert screen coordinates to world coordinates
              const world = viewport.toWorld(e.data.global.x, e.data.global.y)
              // __ Cancel current movement
              delete moveQ[$localUserSessionID]
              hideTarget()
              // // __ Start new movement
              const targetX = Math.round(world.x)
              const targetY = Math.round(world.y)
              showTarget(targetX, targetY)
              gameRoom.send("go", {
                x: targetX,
                y: targetY,
                originX: localPlayers[$localUserSessionID].avatar.x,
                originY: localPlayers[$localUserSessionID].avatar.y,
              })
            })

            // PLAYER => TELEPORT
            teleportTo = area => {
              // __ Cancel current movement
              delete moveQ[$localUserSessionID]
              hideTarget()
              gameRoom.send("teleport", {
                area: area,
              })
            }

            // *******
            // MESSAGE
            // *******

            // MESSAGE => ADD
            gameRoom.state.messages.onAdd = message => {
              chatMessages = [...chatMessages, message]
              if ($localUserUUID == message.uuid) {
                const messageContainerEl = document.querySelector(
                  "#message-container"
                )
                if (messageContainerEl) {
                  setTimeout(() => {
                    messageContainerEl.scrollTo({
                      top: messageContainerEl.scrollHeight,
                      left: 0,
                      behavious: "smooth",
                    })
                  }, 200)
                }
              }
            }

            // MESSAGE => REMOVE
            gameRoom.state.messages.onRemove = message => {
              try {
                const itemIndex = chatMessages.findIndex(m => m === message)
                chatMessages.splice(itemIndex, 1)
                chatMessages = chatMessages
              } catch (err) {
                setUIState(STATE.ERROR, err)
                console.dir(err)
              }
            }

            // MESSAGE => SUBMIT
            submitChat = event => {
              try {
                gameRoom.send("submitChatMessage", {
                  msgId: nanoid(),
                  uuid: $localUserUUID,
                  name: localPlayers[$localUserSessionID].name,
                  username: localPlayers[$localUserSessionID].discourseName,
                  authenticated:
                    localPlayers[$localUserSessionID].authenticated,
                  text: event.detail.text,
                  room: $currentTextRoom,
                  tint: localPlayers[$localUserSessionID].tint,
                })
              } catch (err) {
                setUIState(STATE.ERROR, err)
                console.dir(err)
              }
            }

            // ************
            // CASE STUDIES
            // ************

            dropCaseStudy = () => {
              gameRoom.send("dropCaseStudy", {
                uuid: localPlayers[$localUserSessionID].carrying,
              })
            }

            pickUpCaseStudy = uuid => {
              gameRoom.send("pickUpCaseStudy", {
                uuid: uuid,
              })
            }

            // __ Create Case Study
            const createCaseStudy = (caseStudy, animate) => {
              const container = new PIXI.Container()
              // __ Hide if currently in a user's inventory
              container.visible = caseStudy.carriedBy === "" ? true : false
              container.uuid = caseStudy.uuid
              container.caseStudyId = caseStudy.caseStudyId
              container.name = caseStudy.name
              container.category = caseStudy.category || "none"
              container.slug = caseStudy.slug
              container.interactive = true
              container.tint = caseStudy.tint

              const graphics = new PIXI.Graphics()
              graphics.beginFill(caseStudy.tint)
              graphics.drawRect(0, 0, 15, 15)
              graphics.endFill()

              // __ Name graphics (shown on hover)
              const textSprite = new PIXI.Text(
                caseStudy.name,
                TEXT_STYLE_CASE_STUDY
              )
              const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE)
              txtBG.tint = 0x000000
              txtBG.width = textSprite.width + 10
              txtBG.height = textSprite.height + 10
              textSprite.x = 5
              textSprite.y = 5
              const textContainer = new PIXI.Container()
              textContainer.addChild(txtBG, textSprite)
              textContainer.name = "text"

              container.x = caseStudy.x
              container.y = animate ? 0 : caseStudy.y

              container.addChild(graphics)

              // __ Animate in with bounce
              if (animate) {
                tweener
                  .add(container)
                  .to({ y: caseStudy.y }, 3, Tweener.ease.bounceOut)
              }

              const onDown = e => {
                // __ Make user drop case study if carrying, to allow picking up new one
                if (
                  localPlayers[$localUserSessionID].carrying &&
                  localPlayers[$localUserSessionID].carrying.length > 0
                ) {
                  gameRoom.send("dropCaseStudy", {
                    uuid: localPlayers[$localUserSessionID].carrying,
                  })
                }

                // __ Move towards clicked case study
                // __ and indicate that it should be picked up once reached
                const g = emergentLayer.children.find(
                  cs => cs.uuid === caseStudy.uuid
                )
                if (g) {
                  intentToPickUp = caseStudy.uuid
                  gameRoom.send("go", {
                    x: g.x,
                    y: g.y,
                    originX: localPlayers[$localUserSessionID].avatar.x,
                    originY: localPlayers[$localUserSessionID].avatar.y,
                  })
                }
                e.stopPropagation()
              }

              const onEnter = () => {
                gameContainer.style.cursor = "pointer"
                textContainer.y =
                  container.y + container.height / 2 - textContainer.height / 2
                textContainer.x =
                  container.x - textContainer.width / 2 + container.width / 2
                playerLayer.addChild(textContainer)
              }

              const onLeave = e => {
                gameContainer.style.cursor = "crosshair"
                playerLayer.removeChild(textContainer)
              }

              container.on("mousedown", onDown)
              container.on("touchstart", onDown)
              container.on("mouseover", onEnter)
              container.on("mouseout", onLeave)

              emergentLayer.addChild(container)
            }

            // CASE STUDY => ADD
            gameRoom.state.caseStudies.onAdd = (caseStudy, sessionId) => {
              if (caseStudiesLoaded) {
                createCaseStudy(caseStudy, true)
              } else {
                createCaseStudy(caseStudy, false)
              }
            }

            // CASE STUDY => REMOVE
            gameRoom.state.caseStudies.onRemove = (caseStudy, sessionId) => {
              // !! TODO: PROPERLY REMOVE CASE STUDY
              // console.log("%_%_%_ Case study removed")
              // console.dir(caseStudy)
            }

            // CASE STUDY => CHANGE
            gameRoom.state.caseStudies.onChange = (caseStudy, sessionId) => {
              const g = emergentLayer.children.find(
                cs => cs.uuid === caseStudy.uuid
              )
              if (g) {
                // __ Darken color one step
                g.children[0].tint = TINTMAP[caseStudy.age - 1]
                // __ Update position if not currently in a user's inventory
                if (caseStudy.carriedBy === "") {
                  g.x = caseStudy.x
                  g.y = caseStudy.y
                  g.visible = true
                } else {
                  g.visible = false
                }
              }
            }

            // ************************
            // GENERAL ERROR HANDELING
            // ************************
            gameRoom.onError((code, message) => {
              setUIState(STATE.ERROR, message)
              console.error("Gameserver error:", message)
            })
          })
          .catch(e => {
            console.dir(e)
            if (e.code == 4215) {
              setUIState(STATE.ERROR, "You have been banned")
            } else {
              setUIState(STATE.ERROR, "FAILED TO CONNECT TO GAMESERVER")
              // Sentry.captureException(err)
            }
          })
      })

      // __ Add exhibition (static) case studies
      caseStudies.then(caseStudies => {
        caseStudies
          .filter(cs => cs._type === "caseStudyExhibition")
          .forEach((cs, i) => {
            const spriteUrl = get(cs, "spriteLink.spriteJsonURL", "")
            const spriteId = "caseStudy-" + cs._id
            const csLoader = new PIXI.Loader()
            csLoader.add(spriteId, spriteUrl).load((loader, resources) => {
              const frames = new PIXI.AnimatedSprite(
                resources[spriteId].spritesheet.animations["frames"]
              )
              frames.animationSpeed = 0.02
              frames.play()

              // __ Name graphics (shown on hover)
              const textSprite = new PIXI.Text(cs.title, TEXT_STYLE_CASE_STUDY)
              const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE)
              txtBG.tint = 0x000000
              txtBG.width = textSprite.width + 10
              txtBG.height = textSprite.height + 10
              textSprite.x = 5
              textSprite.y = 5
              const textContainer = new PIXI.Container()
              textContainer.addChild(txtBG, textSprite)
              textContainer.name = "text"

              const caseStudyLocation = new PIXI.Container()
              caseStudyLocation.addChild(frames)
              caseStudyLocation.x = cs.x
              caseStudyLocation.y = cs.y
              caseStudyLocation.pivot.x = caseStudyLocation.width / 2
              caseStudyLocation.pivot.y = caseStudyLocation.height / 2
              caseStudyLocation.title = cs.title
              caseStudyLocation.interactive = true

              const onDown = e => {
                navigate("/case-studies/" + get(cs, "slug.current", false))
                e.stopPropagation()
              }

              const onEnter = e => {
                gameContainer.style.cursor = "pointer"
                textContainer.y =
                  caseStudyLocation.height / 2 - textContainer.height / 2
                textContainer.x =
                  -(textContainer.width / 2) + caseStudyLocation.width / 2
                caseStudyLocation.addChild(textContainer)
              }

              const onLeave = e => {
                gameContainer.style.cursor = "crosshair"
                caseStudyLocation.removeChild(textContainer)
              }

              caseStudyLocation.on("mousedown", onDown)
              caseStudyLocation.on("touchstart", onDown)
              caseStudyLocation.on("mouseover", onEnter)
              caseStudyLocation.on("mouseout", onLeave)

              exhibitionLayer.addChild(caseStudyLocation)
            })
          })
      })

      // __ Add audio installations
      audioInstallations.then(audioInstallations => {
        audioInstallations.forEach((ai, i) => {
          const spriteUrl = get(ai, "spriteLink.spriteJsonURL", "")
          const spriteId = "audioInstallation-" + ai._id
          const aiLoader = new PIXI.Loader()
          aiLoader.add(spriteId, spriteUrl).load((loader, resources) => {
            const frames = new PIXI.AnimatedSprite(
              resources[spriteId].spritesheet.animations["frames"]
            )
            frames.animationSpeed = 0.02
            frames.play()

            const audioInstallationLocation = new PIXI.Container()
            audioInstallationLocation.addChild(frames)

            // __ Either load stream URL or audio file
            if (ai.streamURL) {
              audioInstallationLocation.audio = new Howl({
                src: ai.streamURL,
                html5: true,
                format: ["mp3", "aac"],
              })
            } else {
              audioInstallationLocation.audio = new Howl({
                src: [ai.audioURL],
                loop: true,
              })
            }

            audioInstallationLocation.x = ai.x
            audioInstallationLocation.y = ai.y
            audioInstallationLocation.pivot.x =
              audioInstallationLocation.width / 2
            audioInstallationLocation.pivot.y =
              audioInstallationLocation.height / 2
            audioInstallationLocation.title = ai.title
            audioInstallationLocation.noAutoplay = ai.noAutoplay
            audioInstallationLocation.slug = get(ai, "slug.current")
            audioInstallationLocation.radius = ai.radius || 400
            audioInstallationLocation.interactive = false

            audioInstallationLayer.addChild(audioInstallationLocation)
          })
        })
      })

      // __ Add landmarks
      landMarks.then(landMarks => {
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

  const getResponsiveWidth = () =>
    window.matchMedia("(max-width: 800px)").matches || sidebarHidden
      ? window.innerWidth
      : window.innerWidth - 400

  onMount(async () => {
    // ___ Set Global scale mode to hard edges
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    // ___ Create Pixi App
    app = new PIXI.Application({
      width: MAP.WIDTH,
      height: MAP.HEIGHT,
      resolution: 1,
    })

    // __ Create Pixi Viewport
    viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: MAP.WIDTH,
      worldHeight: MAP.HEIGHT,
      interaction: app.renderer.plugins.interaction,
    })
    app.stage.addChild(viewport)

    // ___ Create and add layers
    // (1) => Map
    // (2) => Audio Installations
    // (3) => Exhibition/static case studies
    // (4) => Emergent/mobil case studies
    // (5) => Players
    // (6) => Landmarks
    mapLayer = new PIXI.Container()
    emergentLayer = new PIXI.Container()
    exhibitionLayer = new PIXI.Container()
    audioInstallationLayer = new PIXI.Container()
    playerLayer = new PIXI.Container()
    landMarkLayer = new PIXI.Container()
    viewport.addChild(mapLayer)
    viewport.addChild(audioInstallationLayer)
    viewport.addChild(exhibitionLayer)
    viewport.addChild(emergentLayer)
    viewport.addChild(playerLayer)
    viewport.addChild(landMarkLayer)
    // viewport.drag()

    // ___ Start Pixi ticker
    ticker = PIXI.Ticker.shared
    ticker.start()
    ticker.add(updatePositions)

    window.onresize = () => {
      const responsiveWidth = getResponsiveWidth()
      viewport.resize(responsiveWidth, window.innerHeight)
      app.renderer.resize(responsiveWidth, window.innerHeight)
    }
    window.dispatchEvent(new Event("resize"))

    // ___ Give the local user a UUID
    localUserUUID.set(nanoid())

    // !!! HACK
    setTimeout(() => {
      caseStudiesLoaded = true
    }, 5000)

    // ___ Show welcome card if user has not visited in last 7 days
    showWelcomeCard = Cookies.get("tsoap-visitor") ? false : true
    // showWelcomeCard = true
    Cookies.set("tsoap-visitor", "true", { expires: 7 })

    // __ Redirect to authentication if user is marked as logged in
    const authCookie = Cookies.get("tsoap-logged-in")
    if (authCookie && section != "authenticate") {
      window.location =
        "https://sso.tsoap.dev/auth/discourse_sso?params=" + params["*"]
    }

    // __ Add pixi view to DOM
    gameContainer.appendChild(app.view)

    // __ Start the game...
    initializeGameWorld(sso, sig)
  })
</script>

<style lang="scss">
  @import "./variables.scss";

  * {
    box-sizing: border-box;
    font-family: $MONO_STACK;
  }

  .inventory {
    position: fixed;
    width: auto;
    max-width: 50vw;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 1.4em;
    text-align: center;
    bottom: $SPACE_S;
    left: $SPACE_S;
    padding: $SPACE_S;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    cursor: pointer;
    padding-left: $SPACE_M;
    padding-right: $SPACE_M;
    user-select: none;

    @include screen-size("small") {
      bottom: 60px;
      left: $SPACE_S;
      max-width: calc(100vw - 20px);
      z-index: 10;
    }
  }

  .audiochat-box {
    position: fixed;
    width: auto;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    top:  $SPACE_S;
    left: $SPACE_S;
    padding: $SPACE_S;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    display: flex;

    padding-left: $SPACE_M;
    padding-right: $SPACE_M;

    user-select: none;

    @include screen-size("small") {
      top: unset;
      bottom: calc(25vh + 60px);
      left: unset;
      right: $SPACE_S;
      max-width: calc(100vw - 20px);
    }

    .message {
      margin-right: $SPACE_S;
    }

    .button {
      padding-left: $SPACE_M;
      padding-right: $SPACE_M;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      border-radius: 10px;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_DARK;
        color: $COLOR_DARK;
        cursor: pointer;
      }
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
    top: $SPACE_S;
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
    @include screen-size("small") {
      display: none;
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

    @include screen-size("small") {
      width: 100vw;
    }

    .minimap {
      background: black;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      @include screen-size("small") {
        display: none;
      }
    }

    .middle-section {
      height: calc(100% - 240px);

      .top-area {
        position: relative;
        height: 50%;
        width: 100%;
        overflow: hidden;
      }

      .bottom-area {
        background: $COLOR_DARK;
        height: calc(50% - 50px);
        @include hide-scroll;
      }

      .toolbar {
        width: 100%;
        height: 50px;
        z-index: 1000;
        background: $COLOR_DARK;
      }

      @include screen-size("small") {
        display: none;
      }
    }

    .menu {
      height: 40px;
    }

    &.hidden {
      transform: translateX(360px);
      cursor: pointer;
    }
  }

  .main-content-slot {
    position: absolute;
    top: 0;
    right: calc(#{$SIDEBAR_WIDTH} + #{$SPACE_S});
    width: 500px;
    max-width: calc(100vw - (#{$SIDEBAR_WIDTH} + #{$SPACE_L}));
    max-height: 100vh;
    z-index: 100;
    overflow-y: auto;
    font-size: $FONT_SIZE_BASE;
    color: $COLOR_DARK;
    transition: transform 0.5s $transition;

    &.pushed {
      transform: translatex(360px);
    }

    @include hide-scroll;

    @include screen-size("small") {
      position: fixed;
      bottom: unset;
      top: 80px;
      right: unset;
      left: 0;
      max-width: unset;
      width: 100vw;
    }

    transition: transform 0.3s ease-out;

    .content-item {
      width: 100%;
      background: $COLOR_LIGHT;
      z-index: 100;
      font-size: $FONT_SIZE_BASE;
      color: $COLOR_DARK;
      position: relative;
      margin-bottom: $SPACE_S;
      margin-top: $SPACE_S;

      @include hide-scroll;

      .close {
        margin-bottom: 20px;
        position: absolute;
        top: -6px;
        right: $SPACE_S;
        font-size: 38px;
        color: $COLOR_MID_2;
        cursor: pointer;
        text-decoration: none;
        transition: color 0.3s $transition;
        z-index: 10000;

        @include screen-size("small") {
          margin-bottom: 0;
          margin-top: 0;

          &.passive {
            min-height: 100vh;
          }
        }

        &:hover {
          // transform: scale(1.1);
          color: $COLOR_MID_3;
        }
      }

      @include screen-size("small") {
        margin-top: 0;
        margin-bottom: 0;

        &.passive {
          padding-bottom: 140px;
          min-height: 100vh;
        }
      }

      transition: transform 0.3s ease-out;
    }
  }

  .mobile-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    z-index: 1000;
  }

  .mobile-toolkit {

    background: linear-gradient(0deg, rgba(0,0,0,0.6054796918767507) 0%, rgba(0,0,0,0) 100%);
    position: fixed;
    bottom: 50px;
    left: 0;
    width: 100%;
    height: 25vh;
    z-index: 10;

    .toolbar {
      height: 40px;
      padding-bottom:5px;
    }

    &.expanded {
      background: $COLOR_DARK;
      height: calc(100vh - 130px);
      .toolbar {
        background: $COLOR_DARK;
      }
    }

    .close {
      position: fixed;
      top: 67px;
      right: $SPACE_S;
      font-size: 38px;
      color: $COLOR_MID_2;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.3s $transition;
      z-index: 10000;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .mobile-calendar {
    position: fixed;
    background: $COLOR_LIGHT;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    z-index: 1000;
    overflow-x: auto;
    @include hide-scroll;
    border-bottom: 1px solid $COLOR_MID_1;
  }

  .welcome-card {
    padding: $SPACE_S;
    padding-top: $SPACE_L;
  }

  .debug {
    position: fixed;
    bottom: $SPACE_S;
    right: 420px;
    padding: $SPACE_S;
    font-size: 8px;
  }
</style>

<!-- <MetaData /> -->
<!-- Show default if not in special section -->
{#if !['case-studies', 'profiles', 'profiles', 'events', 'pages'].includes(section)}
  <MetaData />
{/if}

<!-- SIDEBAR -->
<!-- Show on desktop only -->
<MediaQuery query="(min-width: 800px)" let:matches>
  {#if matches}
    {#if localPlayers[$localUserSessionID]}
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
          <MiniMap {miniImage} player={localPlayers[$localUserSessionID]} />
        </div>
        <div class="middle-section">
          <div class="top-area">
            <!-- CALENDAR -->
            {#await events then events}
                <EventList {events} />
            {/await}
          </div>
          <div class="bottom-area">
            {#if section == 'seminar'}
              <!-- SEMINAR -->
              <Seminar {slug} />
            {:else if section == 'messages'}
              <!-- MESSAGES -->
              <Messaging {slug} />
            {:else}
              <!-- CHAT -->
              {#each TEXT_ROOMS as TR}
                {#if $currentTextRoom === TR}
                  <Chat
                    chatMessages={chatMessages.filter(m => m.room === TR)}
                    currentRoom={TR} />
                {/if}
              {/each}
            {/if}
            <!-- TOOLBAR-->
            <div class="toolbar">
              <ToolBar
                {section}
                on:submit={submitChat}
                on:teleport={e => {
                  // __ Cancel current movement
                  delete moveQ[$localUserSessionID]
                  hideTarget()
                  teleportTo($currentArea === 5 ? 'green' : 'blue')
                }} />
            </div>
          </div>
        </div>
        <!-- MENUBAR -->
        <div class="menu">
          <Menu />
        </div>
      </div>
    {/if}
  {/if}
</MediaQuery>

<!-- GAME WORLD -->
<div class="game" class:expanded={sidebarHidden} bind:this={gameContainer} />

<!-- MAIN CONTENT -->
<div class="main-content-slot" class:pushed={sidebarHidden}>
  <!-- INFORMATION BOX -->
  {#await welcomeCard then welcomeCard}
  {#if showWelcomeCard}
    <div class="content-item active" transition:fly={{ y: -200 }}>
      <div
        class="close"
        on:click={e => {
          showWelcomeCard = false;
        }}>
        ×
      </div>
      <div class='welcome-card'>
        {@html renderBlockText(get(welcomeCard, 'content.content',[]))}
      </div>
    </div>
  {/if}
  {/await}

  <!-- AUDIOZONE -->
  {#if inAudioZone}
    <div class="content-item active" transition:fly={{ y: -200 }}>
      {#await audioInstallations then audioInstallations}
        <AudioInstallationSingle
          audioInstallation={audioInstallations.find(aI => aI.slug.current === inAudioZone)} />
      {/await}
    </div>
  {/if}

  <!-- LIVE -->
  {#await activeStreams then activeStreams}
    <!-- MAIN AREA -->
    {#if $currentVideoRoom == 'main' && currentStream && !activeContentClosed}
      <div class="content-item active" transition:fly={{ y: -200 }}>
        <div
          class="close"
          on:click={e => {
            activeContentClosed = true;
          }}>
          ×
        </div>
          <LiveSingle
            event={currentStream} />
      </div>
    {/if}
    <!-- SUPPORT AREA -->
    {#if $currentVideoRoom == 'support' && activeStreams.supportStream}
      <div class="content-item active" transition:fly={{ y: -200 }}>
        <div
          class="close"
          on:click={e => {
            activeContentClosed = true;
          }}>
          ×
        </div>
          <LiveSingle
            event={{streamURL: activeStreams.supportStream}}/>
      </div>
    {/if}
  {/await}

  <!-- TEXT CONTENT -->
  {#if ['case-studies', 'profiles', 'profiles', 'events', 'pages'].includes(section)}
    <div
      class="content-item passive"
      class:pushed={!activeContentClosed}
      use:links
      transition:fly={{ y: 200, duration: 400, easing: quartOut }}>
      <a class="close" href="/">×</a>
      <!-- CASE STUDIES -->
      {#await caseStudies then caseStudies}
        {#if section === 'case-studies'}
          {#if slug}
            <!-- SINGLE CASE STUDY -->
            <CaseStudySingle
              caseStudy={caseStudies.find(cs => cs.slug.current === slug)} />
          {:else}
            <!-- LIST CASE STUDY -->
            <CaseStudyList {caseStudies} />
          {/if}
        {/if}
      {/await}
      <!-- USERS -->
      {#await users then users}
        {#if section == 'profiles' && slug}
          <!-- SINGLE PROFILE -->
          <UserProfileSingle
            user={users.find(u => get(u, 'slug.current', '') === slug)} />
        {/if}
      {/await}
      <!-- EVENTS -->
      {#await events then events}
        {#if section === 'events'}
          {#if slug}
            <!-- SINGLE EVENT -->
            <EventSingle event={events.find(ev => ev.slug.current === slug)} />
          {:else}
            <!-- LIST EVENTS -->
            <EventListFull {events} />
          {/if}
        {/if}
      {/await}
      <!-- PAGES -->
      {#await pages then pages}
        {#if section == 'pages' && slug}
          <!-- SINGLE PAGE -->
          <PageSingle
            page={pages.find(p => get(p, 'slug.current', '') === slug)} />
        {/if}
      {/await}
    </div>
  {/if}
</div>

<!-- MOBILE -->
<MediaQuery query="(max-width: 800px)" let:matches>
  {#if matches}
    {#if localPlayers[$localUserSessionID]}
      <!-- MOBILE CALENDAR-->
      <div class="mobile-calendar" use:links>
        {#await events then events}
          <EventList {events} />
        {/await}
      </div>
      <!-- MOBILE TOOLKIT -->
      {#if !audioChatActive}
        <div class="mobile-toolkit" 
          use:links 
          class:expanded={mobileExpanded} 
          on:click={e => {
            if(!mobileExpanded) {
              mobileExpanded = true
            }
          }}>
          {#if mobileExpanded }
            <div
              class="close"
              on:click={e => {
                mobileExpanded = false;
                e.stopPropagation()
                navigate('/')
              }}>
              ×
            </div>
          {/if}
          {#if section == 'seminar'}
            <!-- SEMINAR -->
            <Seminar {slug} mobile={true} {mobileExpanded}/>
          {:else if section == 'messages'}
            <!-- MESSAGES -->
            <Messaging {slug} mobile={true} {mobileExpanded}/>
          {:else}
            <!-- CHAT -->
            {#each Object.values(AREA) as A}
              {#if localPlayers[$localUserSessionID].area === A}
                <Chat
                  chatMessages={chatMessages.filter(m => m.area === A)}
                  currentArea={A}
                  mobile={true}
                  {mobileExpanded}/>
              {/if}
            {/each}
          {/if}
          <!-- TOOLBAR-->
          <div class="toolbar">
            <ToolBar
              {section}
              mobile={true}
              {mobileExpanded}
              on:submit={submitChat}
              on:teleport={e => {
                if(localPlayers[$localUserSessionID].area === 5) {
                  teleportTo('green')
                } else {
                  teleportTo('blue')
                }
              }} />
          </div>
        </div>
      {/if}
      <!-- MOBILE MENU-->
      <div class="mobile-menu" use:links>
        <Menu />
      </div>
    {/if}
  {/if}
</MediaQuery>

<!-- INVENTORY -->
{#if localPlayers && localPlayers[$localUserSessionID] && localPlayers[$localUserSessionID].carrying}
  <div
    class="inventory"
    transition:fly={{ y: 100, duration: 300 }}
    on:click={e => {
      dropCaseStudy(localPlayers[$localUserSessionID].carrying);
    }}>
    <div>
      <InventoryMessage caseStudy={emergentLayer.children.find(cs => cs.uuid === localPlayers[$localUserSessionID].carrying)}/>
    </div>
  </div>
{/if}

<!-- AUDIOCHAT BOX  -->
{#if $localUserAuthenticated && !audioChatActive && localPlayers[$localUserSessionID] && localPlayers[$localUserSessionID].area}
  <div class="audiochat-box">
    <div class="message">
      Nearby audioroom
      <strong>{$currentAudioRoom}</strong>
    </div>
    <div
      class="button"
      on:click={e => {
        audioChatActive = true;
      }}>
      Join
    </div>
  </div>
{/if}

<!-- AUDIO CHAT -->
{#if audioChatActive}
  <AudioChat
    user={localPlayers[$localUserSessionID]}
    userName={localPlayers[$localUserSessionID].name}
    roomName={$currentAudioRoom}
    roomId={$currentAudioRoom}
    on:close={e => {
      audioChatActive = false;
    }} />
{/if}

<!-- LOADING -->
{#if UI.state == STATE.LOADING}
  <LoadingScreen />
{/if}

<!-- ERROR -->
{#if UI.state == STATE.ERROR}
  <Error message={UI.errorMessage} />
{/if}

{#if $currentAreaObject}
  <div class="debug" style={'background-color:' + $currentAreaObject.color}>
    <strong>{$currentAreaObject.title}</strong>
    / video:
    {$currentAreaObject.videoRoom}
    / audio:
    {$currentAreaObject.audioRoom}
    / text:
    {$currentAreaObject.textRoom}
  </div>
{/if}
