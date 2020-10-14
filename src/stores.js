import { writable, derived } from "svelte/store"
import get from "lodash/get"

  // *** GLOBAL
  import {
    COLORMAP,
    HEX_MAP,
  } from "./global.js"

// WRITABLE
export const localUserUUID = writable("")
export const localUserSessionID = writable("")
export const localUserAuthenticated = writable(false)
export const authenticatedUserInformation = writable({})
export const globalSettings = writable({})
export const areaList = writable({})
export const currentArea = writable(4)

// export const AREA = { YELLOW: 2, RED: 3, GREEN: 4, BLUE: 5, MAGENTA: 6, CYAN: 7, PURPLE: 8, TEAL: 9 }

export const currentAreaObject = derived(
    [currentArea, areaList ],
    ([$currentArea, $areaList]) => {
        let obj = {}
        if($areaList && Array.isArray($areaList)) {
            console.log('___ currentArea => color', HEX_MAP[COLORMAP[$currentArea]])
            obj = $areaList.find(a => a.color === HEX_MAP[COLORMAP[$currentArea]]) 
        }
        console.dir(obj)
        if(obj) {
            console.log('___ currentArea =>', obj.title)
        }
        return obj
    }
  )

  export const currentAudioRoom = derived(
    [currentAreaObject],
    ([$currentAreaObject]) => {
        if($currentAreaObject.audioRoom) {
            console.log('___ $currentAudioRoom', parseInt(get($currentAreaObject, 'audioRoom', "1")))
            return parseInt(get($currentAreaObject, 'audioRoom', "1"))
        } else {
            return 0
        }
    }
  )

  export const currentTextRoom = derived(
    [currentAreaObject],
    ([$currentAreaObject]) => {
        if($currentAreaObject.textRoom) {
            console.log('___ $currentTextRoom', parseInt(get($currentAreaObject, 'textRoom', "2")))
            return parseInt(get($currentAreaObject, 'textRoom', "2"))
        } else {
            return 0
        }
    }
  )

  export const currentVideoRoom = derived(
    [currentAreaObject],
    ([$currentAreaObject]) => {
        if($currentAreaObject.videoRoom) {
            console.log('___ $currentVideoRoom', get($currentAreaObject, 'videoRoom', "none"))
            return get($currentAreaObject, 'videoRoom', "none")
        } else {
            return 0
        }
    }
  )


