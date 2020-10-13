<script>
  // # # # # # # # # # # # # #
  //
  //  METADATA
  //
  // # # # # # # # # # # # # #
  // _lodash
  import get from "lodash/get"
  import has from "lodash/has"
  import isArray from "lodash/isArray"
  import isEmpty from "lodash/isEmpty"
  import truncate from "lodash/truncate"

  // *** SANITY
  import { toPlainText, urlFor } from "./sanity.js"

  // *** STORES
  import { globalSettings } from "./stores.js"

  // *** PROPS
  export let post = {}

  console.log("_____ METADATA")
  console.dir(post)

  const stripHtml = html => {
    let tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  let title = ""
  let description = ""
  let image = ""

  $: {
    if (has(post, "name") && !isEmpty(post.name)) {
      title = stripHtml(post.name) + " | " + $globalSettings.title
    } else if (has(post, "title") && !isEmpty(post.title)) {
      title = stripHtml(post.title) + " | " + $globalSettings.title
    } else {
      title = $globalSettings.title
    }
  }

  $: {
    description =
      has(post, "content.content") &&
      isArray(post.content.content) &&
      !isEmpty(post.content.content)
        ? truncate(toPlainText(post.content.content), {
            length: 260,
            separator: /.? +/,
          })
        : $globalSettings.siteDescription
  }

  $: {
    image =
      has(post, "mainImage") && post.mainImage
        ? urlFor(post.mainImage).quality(80).height(800).width(1200).url()
        : urlFor($globalSettings.metaImage)
            .quality(80)
            .height(800)
            .width(1200)
            .url()
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={title} />
  <meta property="twitter:title" content={title} />
  <meta property="description" content={description} />
  <meta property="og:description" content={description} />
  <meta property="twitter:description" content={description} />
  <meta property="image" content={image} />
  <meta property="og:image" content={image} />
  <meta property="twitter:image" content={image} />
</svelte:head>
