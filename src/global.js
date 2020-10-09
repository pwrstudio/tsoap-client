import { format, getYear, formatDistanceToNow } from "date-fns"

export const SANITY_PROJECT_ID = "bu5rnal5"

// export const KEYBOARD = {
//   UP: 38,
//   DOWN: 40,
//   LEFT: 37,
//   RIGHT: 39,
//   ENTER: 13,
// }

export const AREA = { YELLOW: 2, RED: 3, GREEN: 4, BLUE: 5 }
export const COLORMAP = ["WHITE", "BLACK", "YELLOW", "RED", "GREEN", "BLUE"]
// export const TINTMAP = [
//   0x111111,
//   0x333333,
//   0x666666,
//   0x777777,
//   0x888888,
//   0x999999,
//   0xaaaaaa,
//   0xcccccc,
//   0xdddddd,
//   0xffffff,
// ]
export const TINTMAP = [0x111111, 0x666666, 0x888888, 0xaaaaaa, 0xffffff]
export const FORMATMAP = {
  pdfBlock: "PDF",
  videoBlock: "VIDEO",
  audioBlock: "AUDIO",
  imageBlock: "IMAGE",
}

export const MAP = { WIDTH: 4000, HEIGHT: 4000 }

export const QUERY = {
  GRAPHICS_SETTINGS:
    "*[_id == 'graphics-settings']{..., mapLink->{'mainImage': mainImage,'miniImage': miniImage,'pathfindingGridUrl': pathfindingGrid.asset->url}, activeAvatars[]->{title, _id, 'spriteJsonURL': spriteJson.asset->url}}[0]",
  EVENTS:
    "*[_type == 'event']{..., participants[]->{slug,name}, connectedCaseStudies[]->{...,participants[]->{slug,name,username}},}",
  USERS: "*[_type == 'participant']",
  PAGES: "*[_type == 'page']",
  SEMINAR: "*[_type == 'seminar' && slug.current == $slug][0]",
  SEMINAR_PARTICIPANTS: "*[_type == 'participant' && seminarLink._ref == $id]",
  AUTH_USER_INFO:
    "*[_type == 'participant' && username == $username]{..., seminarLink->{...}}[0]",
  AUDIO_INSTALLATIONS:
    "*[_type == 'audioInstallation']{..., participants[]->{slug,name,username}, 'audioURL': soundFile.asset->url,spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}",
  CASE_STUDIES:
    "*[_type in ['caseStudyEmergent', 'caseStudyExhibition']]{..., connectedEvents[]->{...,participants[]->{slug,name,username}}, participants[]->{slug,name,username}, spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}",
  LAND_MARKS:
    "*[_type == 'landmark']{..., 'spriteJsonURL': spriteJson.asset->url}",
  ACTIVE_STREAMS:
    "*[_id == 'active-streams']{..., mainStream->{..., participants[]->{slug,name,username}}}[0]",
  WELCOME_CARD: "*[_id == 'welcome-card'][0]",
  CONNECTED_TO_USER: "*[participants[]._ref == $id]{...,participants[]->{...}}",
}

export const TEXT_STYLE = {
  fontFamily: "IBM Plex Mono",
  fontSize: 16,
  align: "center",
  fill: "white",
}

// const mainFormat = "MMM dd yyyy – HH:mm"
// const mainFormat = "MMM dd – HH:mm"
const mainFormat = "HH:mm 'CET,' EEE MMM dd"

export const formattedDate = (start, end) => {
  try {
    if (!start) {
      return false
    }
    const startDate = Date.parse(start)

    if (!startDate) {
      return false
    }

    if (!end) {
      return format(startDate, mainFormat)
    }

    const endDate = Date.parse(end)

    if (format(startDate, "dd.MM.yyyy") == format(endDate, "dd.MM.yyyy")) {
      return format(startDate, "dd.MM.yyyy")
    }

    const startFormat =
      getYear(startDate) == getYear(endDate) ? "dd.MM" : "dd.MM.yyyy"
    const endFormat = "dd.MM.yyyy"

    return format(startDate, startFormat) + " – " + format(endDate, endFormat)
  } catch (err) {
    console.dir(err)
  }
}

export const formattedChatDate = start => {
  try {
    const startDate = start ? start : Date.now()
    return format(startDate, "HH:mm EEE")
  } catch (err) {
    console.dir(err)
  }
}

export const nanoid = (t = 21) => {
  let e = "",
    r = crypto.getRandomValues(new Uint8Array(t))
  for (; t--; ) {
    let n = 63 & r[t]
    e +=
      n < 36
        ? n.toString(36)
        : n < 62
        ? (n - 26).toString(36).toUpperCase()
        : n < 63
        ? "_"
        : "-"
  }
  return e
}

export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
  Math.ceil(min)

export function debounce(fn, wait = 1) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
}
