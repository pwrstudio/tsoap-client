import { writable } from 'svelte/store'

// WRITABLE
export const localUserUUID = writable('')
export const localUserTint = writable('')
export const localUserName = writable('')
export const localUserSessionID = writable('')
export const localUserArea = writable(false)