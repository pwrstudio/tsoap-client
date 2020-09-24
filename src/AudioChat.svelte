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
  export let roomId = 4

  const dispatch = createEventDispatcher()

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
    console.log("ROOM ID", roomId)
    let register = { request: "join", room: roomId, display: userName }
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

  .audioChatContainer {
    position: fixed;
    width: auto;
    min-width: 400px;
    background: $COLOR_LIGHT;
    height: auto;
    line-height: 2em;
    text-align: center;
    top: 15px;
    left: 15px;
    padding: 10px;
    border-radius: 4px;
    font-size: $FONT_SIZE_BASE;
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

      .microphone {
        opacity: 0.5;
      }
    }

    .userlist {
      min-height: 200px;
      margin-top: 20px;

      .user {
        margin-bottom: 10px;
        width: 100%;
        line-height: 3em;
        height: 3em;

        .icon {
          float: left;
          height: 3em;
          width: 3em;
          border-radius: 3em;
          margin-right: 2em;
          background: $COLOR_DARK;
        }

        .name {
          float: left;
        }
        .speaking {
          float: right;
          display: flex;
          align-items: center;
          height: 3em;
          padding-right: 15px;

          svg {
            opacity: 0.5;
          }
        }
      }
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
    <div class="microphone">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"><path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
    </div>
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
        <div class="icon" />
        <div class="name">{user.display}</div>
        <div class="speaking">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"><path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
        </div>
      </div>
    {/each}
  </div>
</div>
