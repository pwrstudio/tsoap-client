<script>
    // # # # # # # # # # # # # #
    //
    //  Audio Chat
    //
    // # # # # # # # # # # # # #

    // IMPORTS
    import get from 'lodash/get'
    import { fade } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'
    import { onMount, onDestroy } from 'svelte';

    // PROPS
    export let name = ''
    
    const dispatch = createEventDispatcher()

	// const server = 'http://54.93.169.243:8088/janus';
	const server = 'https://janus.tsoap.dev'
	let username =''

	let janus = {}
	let mixertest = null;
	const opaqueId = "audiobridgetest-"+Janus.randomString(12);
	const myroom = 1234;	// Demo room
	let webrtcUp = false;
	let audioenabled = false;
	let myId = ''
	let active = false
	let audioActive = false
	let toggleaudio = () => {}

	let userList = []

	const startAudioChat = () => {
		active = true;

		Janus.init({debug: true, callback: () => {
			if(!Janus.isWebrtcSupported()) {
				bootbox.alert("No WebRTC support... ");
				return;
			}
			// console.dir(Janus)
			janus = new Janus({server: server, success: function() {
			console.dir(janus)
			janus.attach({plugin: "janus.plugin.audiobridge",
				opaqueId: opaqueId,
				success: pluginHandle => {
					console.dir(pluginHandle)
					mixertest = pluginHandle;
					Janus.log("Plugin attached! (" + mixertest.getPlugin() + ", id=" + mixertest.getId() + ")");
					registerUsername()
				},
				error: error => {
					console.error("-- Error attaching plugin...", error);
				},
				consentDialog: on => {
					// console.log('consent dialog')
				},
				iceState: state => {
					// console.log("ICE state changed to " + state);
				},
				mediaState: (medium, on) => {
					console.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
				},
				webrtcState: on => {
					console.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
				},
				onmessage: (msg, jsep) => {
					console.log(" ::: Got a message :::", msg);
					const event = msg["audiobridge"];
					console.log("Event: " + event);
					if(event) {
						if(event === "joined") {
							if(msg["id"]) {
								console.dir(msg)
								myId = msg["id"];
								userList = [...userList, {display: name, id: myId, setup: true, muted: false, talking: false, isSelf: true}];
								// console.log("Successfully joined room " + msg["room"] + " with ID " + myId);
								if(!webrtcUp) {
									webrtcUp = true;
									// Publish our stream
									mixertest.createOffer({
										media: { video: false},
										success:jsep => {
											// console.log("Got SDP!", jsep);
											var publish = { request: "configure", muted: false };
											mixertest.send({ message: publish, jsep: jsep });
										},
										error: error => {
											// console.error("WebRTC error:", error);
										}
									});
								}
							}
							if(msg["participants"]) {
								userList = [...userList, ...msg["participants"]];
								console.dir(userList);
							}
						} else if(event === "talking") {
							console.log('TALKING')
							console.log(msg["id"])
							let index = userList.findIndex(u => u.id === msg["id"])
							console.log(index)
							userList[index].talking = true
						} else if(event === "stopped-talking") {
							console.log('STOPPED TALKING')
							console.log(msg["id"])
							let index = userList.findIndex(u => u.id === msg["id"])
							console.log(index)
							userList[index].talking = false
						} else if(event === "roomchanged") {
							// console.log("Moved to room " + msg["room"] + ", new ID: " + myId);
						} else if(event === "destroyed") {
							console.log("The room has been destroyed!");
						} else if(event === "event") {
							if(msg["participants"]) {
								console.log('participant change')
								// console.dir(...userList)
								// console.dir(...msg["participants"])
								// userList = [...userList, ...msg["participants"]];
							} else if(msg["error"]) {
								console.error(msg["error"])
							}
							if(msg["leaving"]) {
								Janus.log("Participant left: " + msg["leaving"] + ")");
								let index = userList.findIndex(u => u.id === msg["leaving"])
								console.log(index)
								userList.splice(index, 1)
								userList = userList
							}
						}
					}
					if(jsep) {
						Janus.debug("Handling SDP as well...", jsep);
						mixertest.handleRemoteJsep({ jsep: jsep });
					}
				},
				// onlocalstream: stream => {
				// 	Janus.debug(" ::: Got a local stream :::", stream);
				// },
				onremotestream: stream => {
					// console.log('remote stream recieved')
					// console.dir(stream)

					Janus.attachMediaStream(document.querySelector('#roomaudio'), stream);

					// Mute button
					audioenabled = true;

					toggleaudio = () => {
						audioenabled = !audioenabled;
						mixertest.send({ message: { request: "configure", muted: !audioenabled }});
					}

				},
				oncleanup: () => {
					webrtcUp = false;
					// console.log(" ::: Got a cleanup notification :::");
				}
			})
		}})

		}});
	}

	const registerUsername = () => {
		let register = { request: "join", room: myroom, display: name };
		mixertest.send({ message: register});
	}

    onMount(async () => {
        startAudioChat()
    })

    onDestroy(async () => {
        console.log('DESTROYING JANUS SESSION')
        janus.destroy()
    })
    
    </script>
  

<style lang="scss">
    @import "./variables.scss";

    .audioChatContainer {
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
            padding-top: 40px;

            .close {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
                }
            }

            .user {
                background: lightgrey;
                padding:20px;
                margin-bottom: 10px;
            }

            .header {
                background: #444444;
                color: white;
            }

            .talking {
                background: lightgreen;
            }

        }
    }
</style>

<div transition:fade class="audioChatContainer">

    <div class="box">
        <div class='close' on:click={e => {
            dispatch('close')
        }}>CLOSE</div>
       	<audio id="roomaudio" width="100%" height="100%" autoplay/>

		<div class='userlist'>
			<div class='user header'>
				Connected users
			</div>
			{#each userList as user (user.id)}
				<div class='user {user.id}' class:talking={user.talking} transition:fade>
					{user.display} {#if user.isSelf}(*){/if}
				</div>
			{/each}
		</div>
    </div>
</div>