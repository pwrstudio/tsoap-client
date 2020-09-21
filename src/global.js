import { format, getYear, formatDistanceToNow } from "date-fns"

export const SANITY_PROJECT_ID = "bu5rnal5"

export const KEYBOARD = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ENTER: 13,
}

export const COLORMAP = ["WHITE", "BLACK", "YELLOW", "RED", "GREEN", "BLUE"]

export const MAP = { WIDTH: 4000, HEIGHT: 4000 }

export const QUERY = {
  GRAPHICS_SETTINGS:
    "*[_id == 'graphics-settings']{..., mapLink->{'mainImage': mainImage,'miniImage': miniImage,'pathfindingGridUrl': pathfindingGrid.asset->url}, activeAvatars[]->{title, _id, 'spriteJsonURL': spriteJson.asset->url}}[0]",
  EVENTS: "*[_type == 'event']",
  USERS: "*[_type == 'participant']",
  CASE_STUDIES:
    "*[_type == 'caseStudy']{..., spriteLink->{spritesheet, 'spriteJsonURL': spriteJson.asset->url}}",
  LAND_MARKS:
    "*[_type == 'landmark']{..., 'spriteJsonURL': spriteJson.asset->url}",
}

export const TEXT_STYLE = {
  fontFamily: "IBM Plex Mono",
  fontSize: 16,
  align: "center",
  fill: "white",
}

// const mainFormat = "MMM dd yyyy – HH:mm"
// const mainFormat = "MMM dd – HH:mm"
const mainFormat = "MMM dd yyyy"

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

export const formattedChatDate = (start) => {
  try {
    const startDate = start ? start : Date.now()
    return format(startDate, "HH:mm:ss")
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
