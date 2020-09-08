<script>
  // # # # # # # # # # # # # #
  //
  //  TSoaP World View
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import { onMount } from 'svelte'
  import * as Colyseus from 'colyseus.js'
  import * as PIXI from 'pixi.js'
  import { Viewport } from 'pixi-viewport'
  import Chance from 'chance'
  import get from 'lodash/get'
  import has from 'lodash/has'
  import sample from 'lodash/sample'
  import tail from 'lodash/tail'
  import { fade, fly, scale } from 'svelte/transition'
  import { urlFor, loadData, renderBlockText } from './sanity.js'
  import { links } from 'svelte-routing'

  const chance = new Chance()
  // import Tweener from "tweener";

  // COMPONENTS
  import Chat from './Chat.svelte'
  import UserList from './UserList.svelte'
  import Login from './Login.svelte'
  import CaseStudy from './CaseStudy.svelte'
  import Banned from './Banned.svelte'
  import AudioChat from './AudioChat.svelte'

  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }

  let deltaJump = 0
  let hiddenTime = 0

  // If the page is hidden, pause the video;
  // if the page is shown, play the video
  function handleVisibilityChange() {
    if (document[hidden]) {
      // console.log('HIDDDEN')
      hiddenTime = Date.now()
      // console.log(hiddenTime)
      // pageVisible = false
    } else {
      console.log('SHOWN')
      let timeDiff = Date.now() - hiddenTime
      deltaJump = Math.round(timeDiff / 16.6666)
      console.log(deltaJump)
    }
  }

  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (
    typeof document.addEventListener === 'undefined' ||
    hidden === undefined
  ) {
    console.log(
      'This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.'
    )
  } else {
    // Handle page visibility change
    document.addEventListener(visibilityChange, handleVisibilityChange, false)
  }
  // STORES
  import {
    localUserUUID,
    localUserName,
    localUserTint,
    localUserSessionID,
    localUserArea,
    inPrivateChat,
  } from './stores.js'

  localUserUUID.set(chance.guid())

  // PROPS
  export let authenticate = false
  export let login = false
  export let debug = false
  // export let position = false
  // export let x = 0
  // export let y = 0
  export let sso = false
  export let sig = false

  // GLOBAL
  import {
    formattedDate,
    KEYBOARD,
    MAP_WIDTH,
    MAP_HEIGHT,
    colorTrans,
  } from './global.js'

  // const tweener = new Tweener(1 / 60);

  // ** SANITY
  // const query = "*[slug.current == $slug]{..., author[]->{title, slug}}[0]";
  // const params = { slug: slug };
  let events = loadData("*[_type == 'event']")
  let caseStudies = loadData(
    "*[_type == 'caseStudy']{..., spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}"
  )
  let graphicsSettings = loadData(
    "*[_id == 'graphics-settings']{..., mapLink->{'mainImageUrl': mainImage.asset->url}, activeAvatars[]->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}[0]"
  )

  // events.then((events) => {
  //   console.log('EVENTS')
  //   console.dir(events)
  // })

  // caseStudies.then((caseStudies) => {
  //   console.log('CASE STUDIES')
  //   console.dir(caseStudies)
  // })

  // DEBUG VARIABLES
  let worldX = 0
  let worldY = 0
  let screenX = 0
  let screenY = 0
  let rendererHeight = 0
  let rendererWidth = 0
  let viewportHeight = 0
  let viewportWidth = 0
  let debugWaypointIndex = 0
  let debugWaypointTotal = 0
  let debugWaypointX = 0
  let debugWaypointY = 0
  let debugWaypointDirection = ''
  let debugWaypointSteps = 0

  // DOM REFERENCES
  let gameContainer = {}

  // VARIABLES
  let popUpText = false
  let playersInProximity = []
  let newUserName = ''
  let newUserColor = ''
  let newUserAvatar = 1
  let loggedIn = false
  let userLoaded = false
  let showUserList = false
  let showChat = false
  let banned = false
  let inMotion = false

  let caseStudyActive = false
  let currentCaseStudy = {}

  let caseStudyBoxActive = false

  let audioChatActive = false

  let sidebarHidden = false

  let eventActive = false

  let miniImg = false

  let localPlayers = {}
  let chatMessages = []
  let moveQ = []

  let targetGraphics = {}
  let pathGraphics = {}
  let fullPathGraphics = {}
  let wayPointGraphics = {}

  // COLYSEUS
  const client = new Colyseus.Client('ws://localhost:2567')
  // const client = new Colyseus.Client("ws://18.194.21.39:2567");
  // const client = new Colyseus.Client('wss://gameserver.tsoap.dev')

  // PIXI
  let app = {}
  let responsiveWidth = 0
  let viewport = {}
  let loader = {}
  let ticker = {}
  let sheet = []

  // GAME LOOP
  const updatePositions = (delta) => {
    let deltaRounded = Math.round(delta) + deltaJump
    deltaJump = 0

    if (deltaRounded > 10) {
      console.log('HIGH DELTA:', deltaRounded)
    }

    for (let key in moveQ) {
      if (localPlayers[key]) {
        if (moveQ[key].length > 0) {
          if (moveQ[key].length - deltaRounded < 0) {
            // console.log('d diff', moveQ[key].length - deltaRounded)
            let step = moveQ[key][moveQ[key].length - 1]
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            moveQ[key] = []
          } else {
            moveQ[key].splice(0, deltaRounded - 1)
            let step = moveQ[key].shift()
            localPlayers[key].avatar.setAnimation(step.direction)
            localPlayers[key].avatar.x = step.x
            localPlayers[key].avatar.y = step.y
            if (key === $localUserSessionID) {
              debugWaypointX = step.x
              debugWaypointY = step.y
              debugWaypointDirection = step.direction
              debugWaypointSteps = step.steps
            }
          }
        } else {
          localPlayers[key].avatar.setAnimation('rest')
          if (key === $localUserSessionID) {
            inMotion = false
            hideTarget()
            if (debug) {
              hidePath()
              hideFullPath()
              hideWaypoints()
            }
          }
          delete moveQ[key]
          playersInProximity = []
          for (let k in localPlayers) {
            if (
              !localPlayers[k].isSelf &&
              Math.abs(
                localPlayers[k].avatar.x -
                  localPlayers[$localUserSessionID].avatar.x
              ) < 200 &&
              Math.abs(
                localPlayers[k].avatar.y -
                  localPlayers[$localUserSessionID].avatar.y
              ) < 200
            ) {
              playersInProximity.push(localPlayers[k])
            }
          }
          console.dir(playersInProximity)
        }
      } else {
        delete moveQ[key]
      }
    }
  }

  const showTarget = (x, y) => {
    let graphics = new PIXI.Graphics()
    graphics.beginFill(0xff0000)
    graphics.alpha = 0.8
    graphics.zIndex = 1
    graphics.drawCircle(x, y, 10)
    graphics.endFill()
    viewport.addChild(graphics)
    targetGraphics = graphics
  }

  const hideTarget = () => {
    viewport.removeChild(targetGraphics)
    targetGraphics = {}
  }

  const showWaypoints = (path) => {
    try {
      let wayPointMarkers = new PIXI.Graphics()
      wayPointMarkers.beginFill(0x0000ff)
      wayPointMarkers.alpha = 0.9
      wayPointMarkers.zIndex = 1
      path.forEach((p) => {
        wayPointMarkers.drawCircle(p.x, p.y, 2)
      })
      wayPointMarkers.endFill()
      viewport.addChild(wayPointMarkers)
      wayPointGraphics = wayPointMarkers
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const showPath = (path) => {
    try {
      let line = new PIXI.Graphics()
      line.lineStyle(2, 0xff0000, 0.6)
      line.moveTo(
        localPlayers[$localUserSessionID].avatar.x,
        localPlayers[$localUserSessionID].avatar.y
      )
      path.forEach((p) => {
        line.lineTo(p.x, p.y)
      })
      viewport.addChild(line)
      pathGraphics = line
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const hidePath = () => {
    viewport.removeChild(pathGraphics)
    pathGraphics = {}
  }

  const showFullPath = (path) => {
    try {
      let line = new PIXI.Graphics()
      line.lineStyle(10, 0xff7db9, 0.6)
      line.moveTo(
        localPlayers[$localUserSessionID].avatar.x,
        localPlayers[$localUserSessionID].avatar.y
      )
      path.forEach((p) => {
        line.lineTo(p.x, p.y)
      })
      viewport.addChild(line)
      fullPathGraphics = line
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  const hideFullPath = () => {
    viewport.removeChild(fullPathGraphics)
    fullPathGraphics = {}
  }

  const hideWaypoints = () => {
    viewport.removeChild(wayPointGraphics)
    wayPointGraphics = {}
  }

  // FUNCTIONS
  let teleportTo = () => {}
  let submitChat = () => {}
  let startPrivateChat = () => {}
  let leavePrivateChat = () => {}

  const makeNewUser = (sso, sig) => {
    loggedIn = true
    gameContainer.appendChild(app.view)

    // LOADER
    // http://localhost:5000/

    graphicsSettings.then((graphicsSettings) => {
      console.dir(graphicsSettings.mapLink.mainImageUrl)
      miniImg = graphicsSettings.mapLink.mainImageUrl

      let spriteUrl = get(
        graphicsSettings,
        'activeAvatars[0].spriteJsonURL',
        '/sprites/avatar.json'
      )
      console.log(spriteUrl)

      let mapUrl = get(graphicsSettings, 'mapLink.mainImageUrl', '')
      console.log(mapUrl)

      loader
        .add('map', mapUrl)
        .add('avatar', spriteUrl)
        .load((loader, resources) => {
          let map = new PIXI.Sprite(resources.map.texture)
          map.width = MAP_WIDTH
          map.height = MAP_HEIGHT
          viewport.addChild(map)

          console.dir(resources)

          sheet.push(resources['avatar'].spritesheet)

          let avatarIndex = 0

          console.dir(sheet)

          // CREATE PLAYER
          const createPlayer = (playerOptions, sessionId) => {
            let front = new PIXI.AnimatedSprite(sheet[0].animations['front'])
            let back = new PIXI.AnimatedSprite(sheet[0].animations['back'])
            let left = new PIXI.AnimatedSprite(sheet[0].animations['left'])
            let right = new PIXI.AnimatedSprite(sheet[0].animations['right'])
            let rest = new PIXI.AnimatedSprite(sheet[0].animations['rest'])

            rest.name = 'rest'
            front.name = 'front'
            back.name = 'back'
            left.name = 'left'
            right.name = 'right'

            rest.visible = true
            front.visible = false
            back.visible = false
            left.visible = false
            right.visible = false

            rest.animationSpeed = 0.02
            front.animationSpeed = 0.1
            back.animationSpeed = 0.1
            left.animationSpeed = 0.1
            right.animationSpeed = 0.1

            rest.play()
            front.play()
            back.play()
            left.play()
            right.play()

            let avatar = new PIXI.Container()
            avatar.addChild(left, right, back, front, rest)
            avatar.motionState = 'rest'
            avatar.setAnimation = (direction) => {
              avatar.motionState = direction
              avatar.children.forEach((c) => {
                c.visible = c.name == direction ? true : false
              })
            }
            avatar.x = playerOptions.x
            avatar.y = playerOptions.y
            console.log('height', avatar.height)
            console.log('width', avatar.width)
            avatar.pivot.x = avatar.width / 2
            avatar.pivot.y = avatar.height / 2
            avatar.interactive = true

            let player = {
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
              isSelf: playerOptions.uuid == $localUserUUID,
            }

            const onDown = (e) => {
              startPrivateChat(player)
              e.stopPropagation()
            }

            const onEnter = () => {
              popUpText = player.name
            }

            const onLeave = () => {
              popUpText = false
            }

            player.avatar.on('mousedown', onDown)
            player.avatar.on('touchstart', onDown)
            player.avatar.on('mouseover', onEnter)
            player.avatar.on('mouseout', onLeave)

            viewport.addChild(player.avatar)

            if (player.isSelf) {
              viewport.follow(player.avatar)
              userLoaded = true
              localUserTint.set(playerOptions.tint)
              localUserName.set(player.name)
              localUserSessionID.set(player.id)
            }

            return player
          }

          let playerObject = {}

          if (authenticate && sso && sig) {
            playerObject = {
              sso: sso,
              sig: sig,
              uuid: $localUserUUID,
              avatar: avatarIndex,
              tint:
                newUserColor.replace('#', '0x').toUpperCase() ||
                chance
                  .color({ format: 'hex' })
                  .replace('#', '0x')
                  .toUpperCase(),
            }
          } else {
            playerObject = {
              uuid: $localUserUUID,
              name: newUserName || chance.name(),
              avatar: avatarIndex,
              tint:
                newUserColor.replace('#', '0x').toUpperCase() ||
                chance
                  .color({ format: 'hex' })
                  .replace('#', '0x')
                  .toUpperCase(),
            }
          }

          // => GAME ROOM
          client
            .joinOrCreate('game', playerObject)
            .then((gameRoom) => {
              // HACK
              if (authenticate) {
                history.replaceState({}, 'CONNECTED', '/')
              }

              // ******
              // PLAYER
              // ******

              // PLAYER: REMOVE
              gameRoom.state.players.onRemove = (player, sessionId) => {
                try {
                  viewport.removeChild(localPlayers[sessionId].avatar)
                  // HACK
                  setTimeout(() => {
                    delete localPlayers[sessionId]
                    localPlayers = localPlayers
                    // console.dir(localPlayers)
                  }, 500)
                } catch (err) {
                  Sentry.captureException(err)
                }
              }

              // PLAYER: ADD
              gameRoom.state.players.onAdd = (player, sessionId) => {
                localPlayers[sessionId] = createPlayer(player, sessionId)
              }

              // PLAYER: BANNED
              gameRoom.onMessage('banned', (message) => {
                banned = true
              })

              // PLAYER: ILLEGAL MOVE
              gameRoom.onMessage('illegalMove', (message) => {
                hideTarget()
                inMotion = false
              })

              // PLAYER: STATE CHANGE
              gameRoom.state.players.onChange = function (player, sessionId) {
                if (player.path.waypoints.length > 0) {
                  if (localPlayers[sessionId].isSelf) {
                    localUserArea.set(player.area)
                    debugWaypointTotal = player.path.waypoints.length - 1
                    if (debug) {
                      showFullPath(player.fullPath.waypoints)
                      showPath(player.path.waypoints)
                      showWaypoints(player.path.waypoints)
                    }
                  }
                  moveQ[sessionId] = player.path.waypoints
                } else {
                  // TELEPORT
                  if (localPlayers[sessionId].isSelf) {
                    localUserArea.set(player.area)
                  }
                  localPlayers[sessionId].avatar.x = player.x
                  localPlayers[sessionId].avatar.y = player.y

                  playersInProximity = []
                  for (let k in localPlayers) {
                    if (
                      !localPlayers[k].isSelf &&
                      Math.abs(
                        localPlayers[k].avatar.x -
                          localPlayers[$localUserSessionID].avatar.x
                      ) < 200 &&
                      Math.abs(
                        localPlayers[k].avatar.y -
                          localPlayers[$localUserSessionID].avatar.y
                      ) < 200
                    ) {
                      playersInProximity.push(localPlayers[k])
                    }
                  }
                }
              }

              // PLAYER: CLICK / TAP
              viewport.on('clicked', (e) => {
                hideTarget()
                if (debug) {
                  hidePath()
                  hideFullPath()
                  hideWaypoints()
                }
                // if (!inMotion) {
                gameRoom.send('go', {
                  x: Math.round(e.world.x),
                  y: Math.round(e.world.y),
                  originX: localPlayers[$localUserSessionID].avatar.x,
                  originY: localPlayers[$localUserSessionID].avatar.y,
                })

                inMotion = true

                screenX = Math.round(e.screen.x)
                screenY = Math.round(e.screen.y)
                worldX = Math.round(e.world.x)
                worldY = Math.round(e.world.y)

                showTarget(Math.round(e.world.x), Math.round(e.world.y))
                // }
              })

              // PLAYER: TELEPORT
              teleportTo = (area) => {
                // console.log(area)
                gameRoom.send('teleport', {
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
                  Sentry.captureException(err)
                }
              }

              // MESSAGE: SUBMIT
              submitChat = (event) => {
                try {
                  gameRoom.send('submitChatMessage', {
                    msgId: chance.guid(),
                    uuid: $localUserUUID,
                    name: $localUserName,
                    text: event.detail.text,
                    tint: $localUserTint,
                  })
                } catch (err) {
                  Sentry.captureException(err)
                }
              }

              // ************
              // PRIVATE ROOM
              // ************

              // PRIVATE ROOM: START
              startPrivateChat = (partner) => {
                try {
                  client.create('chat', { partner: partner.id }).then((r) => {
                    gameRoom.send('createPrivateRoom', {
                      roomId: r.id,
                      partner: partner.id,
                    })

                    inPrivateChat.set(true)

                    // PRIVATE ROOM: LEAVE
                    leavePrivateChat = () => {
                      r.leave()

                      gameRoom.send('leavePrivateRoom', {
                        roomId: r.id,
                      })

                      inPrivateChat.set(false)
                    }
                  })
                } catch (err) {
                  Sentry.captureException(err)
                }
              }

              // PRIVATE ROOM: ADD
              gameRoom.state.privateRooms.onAdd = (message) => {
                // console.log('add private room')
                // console.dir(gameRoom.state.privateRooms)
                // console.dir(message)
              }

              // PRIVATE ROOM: REMOVE
              gameRoom.state.privateRooms.onRemove = (message) => {
                // console.log('remove private room')
                // console.dir(gameRoom.state.privateRooms)
              }

              // ************
              // GENERAL
              // ************

              // GENNERAL: ERROR
              gameRoom.onError((code, message) => {
                console.error('!!! COLYSEUS ERROR:')
                console.error(message)
                Sentry.captureException(err)
              })
            })
            .catch((e) => {
              if (e.code == 4215) {
                console.log('BANNED')
                banned = true
              } else {
                console.log('GAME ROOM: JOIN ERROR', e)
                Sentry.captureException(e)
              }
            })
        })

      // ADD CASE STUDIES
      // caseStudies.then((caseStudies) => {
      //   console.dir(caseStudies)
      //   caseStudies.forEach((cs, i) => {
      //     console.dir(cs.spriteLink)

      //     let spriteUrl = get(cs, 'spriteLink.spriteJsonURL', '')

      //     loader.add('csSprite', spriteUrl).load((loader, resources) => {
      //       console.dir(resources)
      //       let graphics = new PIXI.Graphics()
      //       graphics.beginFill(0xf012d5)
      //       graphics.alpha = 1
      //       graphics.drawRect(cs.x, cs.y, 140, 140)
      //       graphics.endFill()
      //       graphics.title = cs.title
      //       graphics.index = i
      //       graphics.interactive = true

      //       const onDown = (e) => {
      //         caseStudyActive = true
      //         currentCaseStudy = caseStudies[graphics.index]
      //         e.stopPropagation()
      //       }

      //       const onEnter = (e) => {
      //         popUpText = graphics.title
      //       }

      //       const onLeave = (e) => {
      //         popUpText = false
      //       }

      //       graphics.on('mousedown', onDown)
      //       graphics.on('touchstart', onDown)
      //       graphics.on('mouseover', onEnter)
      //       graphics.on('mouseout', onLeave)

      //       viewport.addChild(graphics)
      //     })
      //   })
      // })

      return graphicsSettings
    })
  }

  onMount(async () => {
    // PIXI: APP
    app = new PIXI.Application({
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      resolution: 1,
    })

    responsiveWidth = window.matchMedia('(max-width: 700px)').matches
      ? window.innerWidth
      : window.innerWidth - 400

    // PIXI: VIEWPORT
    viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: MAP_WIDTH,
      worldHeight: MAP_HEIGHT,
      interaction: app.renderer.plugins.interaction,
    })

    // PIXI: LOADER
    loader = PIXI.Loader.shared

    // PIXI: TICKER
    ticker = PIXI.Ticker.shared

    app.stage.addChild(viewport)
    ticker.start()
    ticker.add(updatePositions)

    rendererHeight = app.screen.height
    rendererWidth = app.screen.width
    viewportHeight = viewport.screenHeight
    viewportWidth = viewport.screenWidth

    window.onresize = () => {
      responsiveWidth =
        window.matchMedia('(max-width: 700px)').matches || sidebarHidden
          ? window.innerWidth
          : window.innerWidth - 400

      viewport.resize(responsiveWidth, window.innerHeight)
      app.renderer.resize(responsiveWidth, window.innerHeight)

      rendererHeight = app.screen.height
      rendererWidth = app.screen.width
      viewportHeight = viewport.screenHeight
      viewportWidth = viewport.screenWidth
    }

    window.dispatchEvent(new Event('resize'))

    if (window.matchMedia('(max-width: 700px)').matches) {
      viewport.setZoom(0.75)
    }

    if (!login) {
      makeNewUser(sso, sig)
    }
  })
</script>

<style lang="scss">
  @import './variables.scss';

  * {
    box-sizing: border-box;
    font-family: $mono-stack;
  }

  .pop {
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    right: 410px;
    padding: 20px;
    border-radius: 10px;

    @include screen-size('small') {
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
    // text-align: center;
    bottom: 10px;
    left: 10px;
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

    @include screen-size('small') {
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
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 10px;
    left: 10px;
    padding: 10px;
    border-radius: 10px;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    @include screen-size('small') {
      top: unset;
      bottom: 20px;
      display: none;
    }
  }

  .top-bar {
    position: fixed;
    bottom: 0%;
    left: 0;
    width: calc(100vw - 420px);
    height: 40px;
    background: #a4a4a4;
    padding: 10px;
    padding-top: 5px;
    overflow: scroll;
    font-size: 12px;
    z-index: 1000;
    user-select: none;

    @include screen-size('small') {
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
    transform: scale(0.8);

    @include screen-size('small') {
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

  .game {
    width: calc(100vw - 400px);
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    float: right;
    opacity: 0;
    transition: opacity 1s ease-out;

    &.loaded {
      opacity: 1;
    }

    @include screen-size('small') {
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
    width: 400px;
    height: 100vh;
    padding: 0;
    overflow: hidden;
    z-index: 100;
    // display: flex;
    // flex-direction: column;
    transform: translateX(0);
    transition: transform 0.5s $transition;

    .minimap {
      background: $COLOR_MID_2;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      @include screen-size('short') {
        height: 150px;
      }

      .map-container {
        height: 200px;
        width: 200px;
        position: relative;
        // transform: scale(1.25);

        // transform: scale(0.8);

        @include screen-size('short') {
          transform: scale(0.5);
        }

        img {
          height: 200px;
          width: 200px;
        }

        .map-marker {
          height: 10px;
          width: 10px;
          border-radius: 5px;
          background: red;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
        }
      }
    }

    .calendar {
      background: $COLOR_LIGHT;
      height: calc(50% - 130px);
      color: $COLOR_DARK;
      font-size: $FONT_SIZE_BASE;
      background: $COLOR_LIGHT;
      overflow: hidden;
      // padding-bottom: 60px;
      @include screen-size('short') {
        height: calc(50% - 65px);
      }

      .calendar-item {
        // padding-left: 20px;
        // padding-right: 20px;
        // padding-top: 10px;
        // padding-bottom: 10px;
        padding: 10px;
        background: red;
        // display: inline-block;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 20px;
        padding-top: 20px;
        background: $COLOR_LIGHT;
        cursor: pointer;

        .title {
          // float: left;
          white-space: nowrap;
        }

        .elips {
          // float: left;
          // font-size: $FONT_SIZE_SMALL;
          margin-left: 10px;
          margin-right: 10px;
          width: 50%;
          white-space: nowrap;
          overflow: hidden;
          flex-shrink: 4;
          // text-overflow: ellipsis;
        }

        .date {
          white-space: nowrap;

          // float: right;
        }

        transition: background 0.5s $transition;

        &:hover {
          background: $COLOR_MID_1;
        }
      }
    }
    .chat {
      background: $COLOR_MID_1;
      height: calc(50% - 130px);

      padding: 10px;
      @include screen-size('short') {
        height: calc(50% - 65px);
      }
    }
    .menu {
      color: $COLOR_DARK;
      font-size: $FONT_SIZE_BASE;
      background: $COLOR_LIGHT;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;

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

    &.hidden {
      transform: translateX(370px);
      cursor: pointer;
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
    // display: flex;
    // flex-direction: column;
    // transform: translateX(0);
    // transition: transform 0.5s $transition;

    img {
      max-width: 80%;
      height: 260px;
      object-fit: cover;
    }

    .title {
      margin-bottom: 20px;
    }
    .date {
      margin-bottom: 20px;
    }

    .cs-item {
      width: 200px;
      margin-right: 10px;
      margin-bottom: 10px;
      float: left;
      img,
      video {
        width: 100%;
        height: auto;
        object-fit: cover;
      }
    }
  }

  .active-content-slot {
    background: $COLOR_MID_1;
    z-index: 100;
    font-size: $FONT_SIZE_BASE;
    color: $COLOR_DARK;
    position: fixed;
    width: auto;
    background: $grey;
    height: auto;
    line-height: 2em;
    top: 10px;
    width: 500px;
    height: 300px;
    right: 410px;
    border-radius: 4px;

    @include screen-size('small') {
      display: none;
    }

    img,
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .title {
      margin-bottom: 20px;
    }
    .date {
      margin-bottom: 20px;
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
      <!-- {graphicsSettings.mapLink.mainImageUrl} -->
      {#if miniImg}<img src={miniImg} />{/if}
      <!-- <img src={get(graphicsSettings, 'mapLink.mainImageUrl', '')} /> -->
      {#if $localUserSessionID && localPlayers && localPlayers[$localUserSessionID] && localPlayers[$localUserSessionID].avatar && localPlayers[$localUserSessionID].avatar.y}
        <div
          class="map-marker"
          style={'top: ' + Math.round(localPlayers[$localUserSessionID].avatar.y / 20 - 5) + 'px; left: ' + Math.round(localPlayers[$localUserSessionID].avatar.x / 20 - 5) + 'px;'} />
      {/if}
    </div>
  </div>
  <!-- CALENDAR -->
  <div class="calendar">
    {#await events then events}
      {#each events as event, index (event._id)}
        <div
          class="calendar-item"
          in:fade={{ delay: 100 * index }}
          on:click={() => {
            if (eventActive && eventActive._id === event._id) {
              eventActive = false
            } else {
              eventActive = event
            }
          }}>
          <div class="title">{event.title}</div>
          <div class="elips">
            .........................................................
          </div>
          <div class="date">{formattedDate(event.startDate)}</div>
        </div>
      {/each}
    {/await}
  </div>
  <!-- CHAT -->
  <div class="chat">
    <Chat {chatMessages} on:submit={submitChat} phoneActive={showChat} />
  </div>
  <!-- MENU -->
  <div class="menu">
    <div>
      <div
        class="menu-item"
        on:click={() => {
          caseStudyBoxActive = !caseStudyBoxActive
        }}>
        Case-Studies
      </div>
      <div class="menu-item">About</div>
      <div class="menu-item">Help</div>
    </div>
    <a href="/login" class="menu-item login">Login</a>
  </div>
</div>

<!-- GAME WORLD -->
<div
  class="game"
  class:expanded={sidebarHidden}
  class:loaded={userLoaded}
  bind:this={gameContainer} />

<!-- PASSIVE CONTENT: CASE STUDY -->
{#if caseStudyActive}
  <div
    class="passive-content-slot"
    transition:fly={{ y: 200 }}
    on:click={(e) => {
      caseStudyActive = false
    }}>
    <div>
      <!-- TITLE -->
      <div class="title"><strong>{currentCaseStudy.title}</strong></div>

      <!-- IMAGE -->
      <div>
        <img
          src={urlFor(currentCaseStudy.mainImage.asset)
            .width(600)
            .quality(90)
            .auto('format')
            .url()} />
      </div>

      <!-- TEXT -->
      <div>
        {#if currentCaseStudy.content && currentCaseStudy.content.content}
          {@html renderBlockText(currentCaseStudy.content.content)}
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- PASSIVE CONTENT: CASE STUDY OVERVIEW -->
{#if caseStudyBoxActive}
  <div
    class="passive-content-slot"
    transition:fly={{ y: 200 }}
    on:click={() => {
      caseStudyBoxActive = !caseStudyBoxActive
    }}>
    <div>
      <!-- TITLE -->
      <div class="title"><strong>Case studies</strong></div>

      {#await caseStudies then caseStudies}
        {#each caseStudies as cs, index (cs._id)}
          <div class="cs-item" in:fade={{ delay: 100 * index }}>
            <div class="title">{cs.title}</div>
            <img
              src={urlFor(cs.mainImage.asset)
                .width(200)
                .height(200)
                .quality(90)
                .auto('format')
                .url()} />
          </div>
        {/each}
      {/await}
    </div>
  </div>
{/if}

<!-- PASSIVE CONTENT: EVENT -->
{#if eventActive}
  <div
    class="passive-content-slot"
    in:fly={{ y: 200, duration: 300 }}
    out:fly={{ y: 200, duration: 300 }}
    on:click={() => {
      eventActive = false
    }}>
    <div>
      <!-- TITLE -->
      <div class="title"><strong>{eventActive.title}</strong></div>

      <div class="date">{formattedDate(eventActive.startDate)}</div>

      <!-- IMAGE -->
      <div>
        <img
          src={urlFor(eventActive.mainImage.asset)
            .width(600)
            .quality(90)
            .auto('format')
            .url()} />
      </div>

      <!-- TEXT -->
      <div>
        {#if eventActive.content.content}
          {@html renderBlockText(eventActive.content.content)}
        {/if}
      </div>
      <div />
    </div>
  </div>
{/if}

<!-- ACTIVE CONTENT: STREAM -->
{#if $localUserArea === 2}
  <div class="active-content-slot" transition:fly={{ y: -200 }}>
    <video src="/test.mp4" muted autoplay loop />
  </div>
{/if}

<!-- PROXIMITY -->
{#if playersInProximity.length > 0}
  <div class="proximity" transition:fly={{ y: 200 }}>
    <div><strong>Players nearby</strong></div>
    {#each playersInProximity as player}
      <div>
        {player.name}
        <button
          on:click={(e) => {
            startPrivateChat(player)
          }}>
          Start chat
        </button>
      </div>
    {/each}
  </div>
{/if}

<!-- CURRENT AREA BOX -->
{#if $localUserArea}
  <div class="current-area tiny">
    Currently in <strong>{colorTrans[$localUserArea]}</strong> area
  </div>
{/if}

<!-- PRIVATE CHAT -->
<!-- {#if $inPrivateChat}
  <div transition:fade class="privateChatContainer" on:click={leavePrivateChat}>
    <div class="box">
      <Chat {chatMessages} on:submit={submitChat} />
    </div>
  </div>
{/if} -->

<!-- POP UP -->
{#if popUpText && !caseStudyActive}
  <div class="pop" in:fade>{popUpText}</div>
{/if}

<!-- LOGIN -->
{#if login && !loggedIn}
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

<!-- AUDIO CHAT -->
{#if audioChatActive}
  <AudioChat
    name={$localUserName}
    on:close={(e) => {
      audioChatActive = false
    }} />
{/if}

<!-- PHONE NAVIGATION -->
<div class="phone-nav">
  <div
    class="userlist-nav"
    on:click={() => {
      showChat = false
      showUserList = !showUserList
    }}>
    USERLIST
  </div>
  <div
    class="chat-nav"
    on:click={() => {
      showUserList = false
      showChat = !showChat
    }}>
    CHAT
  </div>
</div>

<!-- BANNED -->
{#if banned}
  <Banned />
{/if}

<!-- !!!!!!! DEBUG !!!!!!! -->
<!-- !!!!!!! DEBUG !!!!!!! -->
<!-- !!!!!!! DEBUG !!!!!!! -->
<!-- !!!!!!! DEBUG !!!!!!! -->

{#if debug}
  <!-- USER LIST -->
  <!-- <div class="mainUserListContainer" class:phone={showUserList}>
    <UserList playerList={localPlayers} phoneActive={showUserList} />
  </div> -->

  <!-- DEBUG: RENDERING INFO -->
  <div class="pop tiny" in:fade>
    <div><strong>Renderer width:</strong> {rendererWidth}</div>
    <div><strong>Renderer Height:</strong> {rendererHeight}</div>
    <div><strong>viewport width:</strong> {viewportWidth}</div>
    <div><strong>viewport Height:</strong> {viewportHeight}</div>
    <div><strong>Pixel ratio:</strong> {window.devicePixelRatio}</div>
    <div><strong>World X:</strong> {worldX}</div>
    <div><strong>World Y:</strong> {worldY}</div>
    <div><strong>Screen X:</strong> {screenX}</div>
    <div><strong>Screen Y:</strong> {screenY}</div>
  </div>

  <!-- DEBUG: WAYPOINT INFO -->
  {#if inMotion}
    <div class="pop waypoint tiny" in:fade>
      <div>
        <strong>TARGET WAYPOINT:</strong>
        {debugWaypointIndex}/{debugWaypointTotal}
      </div>
      <div><strong>X:</strong> {debugWaypointX}</div>
      <div><strong>Y:</strong> {debugWaypointY}</div>
      <div><strong>Direction:</strong> {debugWaypointDirection}</div>
      <div><strong>Steps:</strong> {debugWaypointSteps}</div>
    </div>
  {/if}

  <!-- DEBUG: TOP BAR -->
  <div class="top-bar">
    <a class="interact link" href="login">Login</a>
    <div
      class="link interact green"
      on:click={() => {
        teleportTo('green')
      }}>
      GOTO: Green
    </div>
    <div
      class="link interact blue"
      on:click={() => {
        teleportTo('blue')
      }}>
      GOTO: Blue
    </div>
    <div
      class="link interact yellow"
      on:click={() => {
        teleportTo('yellow')
      }}>
      GOTO: Yellow
    </div>
    <div
      class="link interact red"
      on:click={() => {
        teleportTo('red')
      }}>
      GOTO: Red
    </div>

    <div
      class="link audio-chat interact"
      on:click={() => {
        audioChatActive = true
      }}>
      ~ ~ Test audio chat ~ ~
    </div>
  </div>
{/if}
