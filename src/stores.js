import { writable } from "svelte/store"

// WRITABLE
export const localUserUUID = writable("")
export const localUserSessionID = writable("")
export const localUserArea = writable(false)
export const inPrivateChat = writable(false)
