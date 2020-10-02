<script>
  // # # # # # # # # # # # # #
  //
  //  Material Item
  //
  // # # # # # # # # # # # # #

  // *** IMPORTS
  import get from "lodash/get"
  import { urlFor } from "../sanity.js"

  import { FORMATMAP } from "../global.js"
  // *** PROPS
  export let item = {}

  let url = ""

  const makeUrl = (ref) => {
    const stripped = ref.substring(5).replace("-", ".")
    // console.log(stripped);
    return "https://cdn.sanity.io/files/bu5rnal5/production/" + stripped
  }

  switch (item._type) {
    case "imageBlock":
      url = urlFor(get(item, "image.asset", {})).url()
      break
    case "audioBlock":
      url = makeUrl(get(item, "audioFile.asset._ref", ""))
      break
    case "fileBlock":
      url = makeUrl(get(item, "file.asset._ref", ""))
      break
    case "pdfBlock":
      url = makeUrl(get(item, "pdfFile.asset._ref", ""))
      break
    case "videoBlock":
      url = makeUrl(get(item, "item.videoFile.asset._ref", ""))
      break
  }
</script>

<style lang="scss">
  @import "../variables.scss";

  $ITEM_HEIGHT: 60px;

  .material-item {
    width: 100%;
    // height: $ITEM_HEIGHT;
    background: $COLOR_LIGHT;
    color: $COLOR_DARK;
    display: block;
    text-decoration: none;
    user-select: none;
    padding-top: 5px;
    padding-bottom: 10px;

    .row {
      width: 100%;

      display: flex;
      justify-content: space-between;

      .title {
        font-family: $SANS_STACK;
        font-weight: 400;
        white-space: nowrap;
      }

      .elips {
        margin-left: 5px;
        margin-right: 5px;
        width: 90%;
        white-space: nowrap;
        overflow: hidden;
        flex-shrink: 4;
        color: $COLOR_MID_2;
      }

      .format {
        white-space: nowrap;
        color: $COLOR_MID_2;
      }
    }

    cursor: pointer;

    // transition: background 0.5s $transition;

    &:hover {
      background: $COLOR_MID_1;
    }

    &.header {
      border-bottom: 1px dotted $COLOR_MID_1;
      cursor: default;

      .archive-link {
        color: $COLOR_MID_2;
        text-decoration: underline;
      }

      &:hover {
        background: unset;
      }
    }
  }
</style>

<a href={url} target="_blank" class="material-item">
  <div class="row">
    <div class="title">{item.title}</div>
    <div class="elips">
      ....................................................................
    </div>
    <div class="format">
      {item._type === 'fileBlock' ? item.fileType : FORMATMAP[item._type]}
    </div>
  </div>
</a>
