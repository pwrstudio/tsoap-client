<script>
  // # # # # # # # # # # # # #
  //
  //  Audio Chat
  //
  // # # # # # # # # # # # # #

  // IMPORTS
  import get from "lodash/get"
  import { fade } from "svelte/transition"
  import { createEventDispatcher } from "svelte"
  import { onMount, onDestroy } from "svelte"

  // PROPS
  export let userName = ""
  export let roomName = ""
  export let roomId = 0

  const dispatch = createEventDispatcher()

  // const server = 'http://54.93.169.243:8088/janus';
  const server = "https://janus.tsoap.dev"
  let username = ""

  let janus = {}
  let mixertest = null
  const opaqueId = "audiobridgetest-" + Janus.randomString(12)
  const myroom = 1234 // Demo room
  let webrtcUp = false
  let audioenabled = false
  let myId = ""
  let active = false
  let audioActive = false
  let toggleaudio = () => {}

  let userList = []

  const startAudioChat = () => {
    active = true

    Janus.init({
      debug: true,
      callback: () => {
        if (!Janus.isWebrtcSupported()) {
          bootbox.alert("No WebRTC support... ")
          return
        }
        // console.dir(Janus)
        janus = new Janus({
          server: server,
          success: function () {
            console.dir(janus)
            janus.attach({
              plugin: "janus.plugin.audiobridge",
              opaqueId: opaqueId,
              success: (pluginHandle) => {
                console.dir(pluginHandle)
                mixertest = pluginHandle
                Janus.log(
                  "Plugin attached! (" +
                    mixertest.getPlugin() +
                    ", id=" +
                    mixertest.getId() +
                    ")"
                )
                registerUsername()
              },
              error: (error) => {
                console.error("-- Error attaching plugin...", error)
              },
              consentDialog: (on) => {
                // console.log('consent dialog')
              },
              iceState: (state) => {
                // console.log("ICE state changed to " + state);
              },
              mediaState: (medium, on) => {
                console.log(
                  "Janus " +
                    (on ? "started" : "stopped") +
                    " receiving our " +
                    medium
                )
              },
              webrtcState: (on) => {
                console.log(
                  "Janus says our WebRTC PeerConnection is " +
                    (on ? "up" : "down") +
                    " now"
                )
              },
              onmessage: (msg, jsep) => {
                console.log(" ::: Got a message :::", msg)
                const event = msg["audiobridge"]
                console.log("Event: " + event)
                if (event) {
                  if (event === "joined") {
                    if (msg["id"]) {
                      console.dir(msg)
                      myId = msg["id"]
                      userList = [
                        ...userList,
                        {
                          display: userName,
                          id: myId,
                          setup: true,
                          muted: false,
                          talking: false,
                          isSelf: true,
                        },
                      ]
                      // console.log("Successfully joined room " + msg["room"] + " with ID " + myId);
                      if (!webrtcUp) {
                        webrtcUp = true
                        // Publish our stream
                        mixertest.createOffer({
                          media: { video: false },
                          success: (jsep) => {
                            // console.log("Got SDP!", jsep);
                            var publish = {
                              request: "configure",
                              muted: false,
                            }
                            mixertest.send({ message: publish, jsep: jsep })
                          },
                          error: (error) => {
                            // console.error("WebRTC error:", error);
                          },
                        })
                      }
                    }
                    if (msg["participants"]) {
                      userList = [...userList, ...msg["participants"]]
                      console.dir(userList)
                    }
                  } else if (event === "talking") {
                    console.log("TALKING")
                    console.log(msg["id"])
                    let index = userList.findIndex((u) => u.id === msg["id"])
                    console.log(index)
                    userList[index].talking = true
                  } else if (event === "stopped-talking") {
                    console.log("STOPPED TALKING")
                    console.log(msg["id"])
                    let index = userList.findIndex((u) => u.id === msg["id"])
                    console.log(index)
                    userList[index].talking = false
                  } else if (event === "roomchanged") {
                    // console.log("Moved to room " + msg["room"] + ", new ID: " + myId);
                  } else if (event === "destroyed") {
                    console.log("The room has been destroyed!")
                  } else if (event === "event") {
                    if (msg["participants"]) {
                      console.log("participant change")
                      // console.dir(...userList)
                      // console.dir(...msg["participants"])
                      // userList = [...userList, ...msg["participants"]];
                    } else if (msg["error"]) {
                      console.error(msg["error"])
                    }
                    if (msg["leaving"]) {
                      Janus.log("Participant left: " + msg["leaving"] + ")")
                      let index = userList.findIndex(
                        (u) => u.id === msg["leaving"]
                      )
                      console.log(index)
                      userList.splice(index, 1)
                      userList = userList
                    }
                  }
                }
                if (jsep) {
                  Janus.debug("Handling SDP as well...", jsep)
                  mixertest.handleRemoteJsep({ jsep: jsep })
                }
              },
              // onlocalstream: stream => {
              // 	Janus.debug(" ::: Got a local stream :::", stream);
              // },
              onremotestream: (stream) => {
                // console.log('remote stream recieved')
                // console.dir(stream)

                Janus.attachMediaStream(
                  document.querySelector("#roomaudio"),
                  stream
                )

                // Mute button
                audioenabled = true

                toggleaudio = () => {
                  audioenabled = !audioenabled
                  mixertest.send({
                    message: { request: "configure", muted: !audioenabled },
                  })
                }
              },
              oncleanup: () => {
                webrtcUp = false
                // console.log(" ::: Got a cleanup notification :::");
              },
            })
          },
        })
      },
    })
  }

  const registerUsername = () => {
    let register = { request: "join", room: myroom, display: userName }
    mixertest.send({ message: register })
  }

  onMount(async () => {
    startAudioChat()
  })

  onDestroy(async () => {
    console.log("DESTROYING JANUS SESSION")
    janus.destroy()
  })
</script>

<style lang="scss">
  @import "./variables.scss";

  .audiochat-box {
    position: fixed;
    width: auto;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    bottom: 15px;
    left: 15px;
    padding: 10px;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    display: flex;

    padding-left: 15px;
    padding-right: 15px;

    user-select: none;

    @include screen-size("small") {
      top: unset;
      bottom: 20px;
      display: none;
    }

    .message {
      // padding-top: 3px;
      // padding-bottom: 3px;
      margin-right: 15px;
    }
  }

  .audioChatContainer {
    position: fixed;
    width: auto;
    min-width: 500px;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    bottom: 15px;
    left: 15px;
    padding: 10px;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
    display: flex;
    font-family: $mono-stack;

    padding-left: 15px;
    padding-right: 15px;

    user-select: none;

    .button {
      // padding-top: 3px;
      // padding-bottom: 3px;
      padding-left: 15px;
      padding-right: 15px;
      border: 1px solid $COLOR_MID_2;
      color: $COLOR_MID_2;
      font-size: $FONT_SIZE_BASE;

      border-radius: 10px;
      text-align: center;

      &:hover {
        border: 1px solid $COLOR_DARK;
        color: $COLOR_DARK;
        cursor: pointer;
      }
    }

    .header {
      display: inline-flex;
      justify-content: space-between;
      flex-direction: row;
      width: 100%;
      height: 30px;
    }

    .userlist {
      min-height: 200px;
    }
    .user {
      padding: 20px;
      margin-bottom: 10px;
    }

    .talking {
      background: lightgreen;
    }
  }
</style>

<div transition:fade class="audioChatContainer">
  <!-- AUDIO ELEMENT -->
  <audio id="roomaudio" width="100%" height="100%" autoplay />

  <!-- HEADER -->
  <div class="header">
    <div class="text">
      {userList.length} users in room <strong>{roomName}</strong>
    </div>
    <div class="microphone">(mute)</div>
    <div
      class="button leave"
      on:click={(e) => {
        dispatch('close')
      }}>
      Leave
    </div>
  </div>

  <!-- USERLIST -->
  <div class="userlist">
    {#each userList as user (user.id)}
      <div class="user {user.id}" class:talking={user.talking} transition:fade>
        {user.display}
        {#if user.isSelf}(*){/if}
      </div>
    {/each}
  </div>
</div>
