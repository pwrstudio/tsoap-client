    gameRoom.onStateChange(state => {
            //   console.log(`${room.sessionId} has a new state:`, state);
            //   console.dir(state.players);
            // console.log("*** STATE CHANGE !!!!");

            // console.dir(state);

            for (let key in state.players) {
              const player = state.players[key];
              // console.dir(player.path.waypoints);

              // console.dir(player);
              // console.log(key, player.x, player.y);
              let index = localPlayers.findIndex(p => p.id === key);
              // console.log(index);

              // if (
              //   localPlayers[index] &&
              //   localPlayers[index].isSelf &&
              //   player.path.waypoints.length > 0
              // ) {
              //   var graphics = new PIXI.Graphics();
              //   graphics.beginFill(0xff0000);
              //   graphics.alpha = 0.7;
              //   graphics.drawCircle(player.x + 20, player.y + 20, 30); // drawCircle(x, y, radius)
              //   graphics.endFill();
              //   app.stage.addChild(graphics);
              // }

              // const STEP = 10;

              // let step = 0;

              localPlayers[index].waypoints = player.path.waypoints;

            
              // console.log("START POSITION");
              // console.log("Y", localPlayers[index].y);
              // console.log("X", localPlayers[index].x);
              // console.log("END POSITION");
              // console.log("Y", player.y);
              // console.log("X", player.x);
              // console.log("PATH");
              // console.log("STEPS", waypoints.length);
              // if (waypoints.length > 0) {
              //   console.log("PATH START POSITION");
              //   console.log("Y", waypoints[0].y);
              //   console.log("X", waypoints[0].x);
              //   console.log("PATH END POSITION");
              //   console.log("Y", waypoints[waypoints.length - 1].y);
              //   console.log("X", waypoints[waypoints.length - 1].x);
              //   console.log("- - - - - ");
              // }

              // function move() {
                // console.log("in");
                // console.log(localPlayers[index]);
                // console.log(index);
                // if (localPlayers[index]) {
                //   let current = waypoints.shift();
                  // console.log(waypoints.length, current.y, current.x);
                  // if (current && current.x) localPlayers[index].x = current.x;
                  // if (current && current.y) localPlayers[index].y = current.y;

                  // if (localPlayers[index].x > player.x) {
                  //   localPlayers[index].x -= STEP;
                  // } else if (localPlayers[index].x < player.x) {
                  //   localPlayers[index].x += STEP;
                  // }
                  // // if (localPlayers[index].x == player.x) {
                  // if (localPlayers[index].y > player.y) {
                  //   localPlayers[index].y -= STEP;
                  // } else if (localPlayers[index].y < player.y) {
                  //   localPlayers[index].y += STEP;
                  // }

                  // Center window
                  // if (localPlayers[index].isSelf) {
                  //   gameContainer.scrollTop =
                  //     localPlayers[index].y - gameContainer.clientHeight / 2;
                  //   gameContainer.scrollLeft =
                  //     localPlayers[index].x - gameContainer.clientWidth / 2;
                  // }

                  // if (waypoints.length > 0) {
                    // window.requestAnimationFrame(move);
                  // } else {
                  //   if (localPlayers[index].isSelf) {
                  //     app.stage.removeChild(graphics);

                      // closePlayers = localPlayers.filter(p => {
                      //   if (!p.isSelf) {
                      //     // console.log(p.x - localPlayers[index].x);
                      //     // console.log(p.y - localPlayers[index].y);
                      //     if (
                      //       Math.abs(p.x - localPlayers[index].x) < 160 &&
                      //       Math.abs(p.y - localPlayers[index].y) < 160
                      //     ) {
                      //       return p;
                      //     }
                      //   }
                      // });

                      // console.dir(closePlayers);
                    // }
                  // }

                  // if (
                  //   localPlayers[index].x !== player.x ||
                  //   localPlayers[index].y !== player.y
                  // ) {
                  //   window.requestAnimationFrame(move);
                  // } else {
                  //   if (localPlayers[index].isSelf) {
                  //     app.stage.removeChild(graphics);
                  //   }
                  // }
                // }
              // }

              // window.requestAnimationFrame(move);
            }
          });

                    // var hammertime = new Hammer(areaEl);
          // hammertime.on("tap", function(ev) {
          //   // console.dir(ev);
          //   // console.log("tap");
          //   // console.log(window.scrollY);
          //   // console.log("X", ev.center.x);
          //   // console.log("Y", ev.center.y);
          //   // console.dir(ev);
          //   // Compensate for window scroll

          //   // console.dir(gameContainer);
          //   // console.dir(ev.center.y + gameContainer.scrollY);

          //   let correctedX =
          //     ev.center.x +
          //     gameContainer.scrollLeft -
          //     30 -
          //     (window.matchMedia("(max-width: 700px)").matches ? 0 : 400);
          //   let correctedY = ev.center.y + gameContainer.scrollTop - 30;

          //   gameRoom.send("go", {
          //     x: correctedX,
          //     y: correctedY
          //   });
          // });
                // console.log("e.event.type", e.event.type);
                // console.log("*");
                // console.log("screen.X", Math.round(e.screen.x));
                // console.log("screen.Y", Math.round(e.screen.y));
                // console.log("world.X", Math.round(e.world.x));
                // console.log("world.Y", Math.round(e.world.y));
                // console.log("- - - - - -");
                // console.dir(e);

                          // console.log(
          //   localPlayers[k].name,
          //   Math.abs(localPlayers[k].x - localPlayers[$localUserSessionID].x)
          // );
          // console.log(
          //   localPlayers[k].name,
          //   Math.abs(localPlayers[k].y - localPlayers[$localUserSessionID].y)
          // );

                  // => CHAT ROOM
        // client
        //   .joinOrCreate("chat")
        //   .then(chatRoom => {
        //     // ADD MESSAGE
        //     chatRoom.state.messages.onAdd = message =>
        //       (chatMessages = [...chatMessages, message]);

        //     // REMOVE MESSAGE
        //     chatRoom.state.messages.onRemove = message => {
        //       try {
        //         const itemIndex = chatMessages.findIndex(m => m === message);
        //         chatMessages.splice(itemIndex, 1);
        //         chatMessages = chatMessages;
        //       } catch (err) {
        //         Sentry.captureException(err);
        //       }
        //     };

        //     // ERROR
        //     chatRoom.onError((code, message) => {
        //       console.error(message);
        //       Sentry.captureException(message);
        //     });

        //     // SUBMIT CHAT
        //     submitChat = event => {
        //       chatRoom.send("submit", {
        //         msgId: chance.guid(),
        //         uuid: $localUserUUID,
        //         name: $localUserName,
        //         text: event.detail.text,
        //         tint: $localUserTint
        //       });
        //     };
        //   })
        //   .catch(e => {
        //     console.log("CHAT ROOM: JOIN ERROR", e);
        //     Sentry.captureException(e);
        //   });