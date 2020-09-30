import { writable } from "svelte/store"

// WRITABLE
export const localUserUUID = writable("")
export const localUserSessionID = writable("")
export const localUserAuthenticated = writable(false)
export const authenticatedUserInformation = writable({})
