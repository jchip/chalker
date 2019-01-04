"use strict";

/* eslint-disable complexity, max-statements, no-magic-numbers */

const assert = require("assert");
const chalk = require("chalk");

//
// convert color markers in a string to terminal color codes with chalk
// color marker format is "<red>red text</red><blue.bold>blue bold text</blue.bold>"
// the end marker can simply be "</>" also
// the marker is converted to chalk methods directly, for example:
// - chalk.red is called for "<red>"
// - chalk.blue.bold is called for "<blue.bold>"
//
// More advanced colors can be applied with:
//
// <(r,g,b)>, <rgb(255,10,20)>
// <bg(r,g,b)>, <bgRgb(255,10,20)>
// <#FF0000>, <bg#0000FF>, <hex(#FF0000)>, <bgHex(#0000FF)>
// <(orange)>, <keyword(orange)>, <keyword('orange')>,
//    <keyword("orange")>, <keyword(`orange`)>
// <bg(orange)>, <bgKeyword(orange)>, <bgKeyword('orange')>,
//    <bgKeyword("orange")>, <bgKeyword(`orange`)>
// <hsl(32,100,50)>, <hsv(32,100,100)>, <hwb(32,0,50)>
//
// any thing that's not found as a basic color is tried using chalk.keyword
//
// <orange>, <'orange'>, <"orange">, <`orange`>
//
// If it's prefixed with `"bg-"` or `"bg "` then it's tried using chalk.bgKeyword
//
// <bg-orange>, <bg orange>
//
// These can be comined with . in any order as long as they work with chalk
//
// ie: <#FF0000.bg#0000FF.orange.keyword()>
//

function deQuote(str, marker) {
  const q = str[0];
  if (q === `'` || q === `"` || q === "`") {
    // remove enclosing quotes ', ", or ` if they are present
    assert(str.endsWith(q), `chalk ${marker} param must be enclosed with matching quote ${q}`);
    str = str.substr(1, str.length - 2);
  }

  return str;
}

const htmlEntities = {
  [`&quot;`]: `"`,
  [`&amp;`]: "&",
  [`&apos;`]: "'",
  [`&lt;`]: "<",
  [`&gt;`]: ">",
  [`&nbsp;`]: "\xa0",
  [`&copy;`]: "\xa9",
  [`&reg;`]: "\xae"
};

function decodeHtml(str) {
  return str.replace(/&[a-z]+;/g, m => htmlEntities[m] || m);
}

function applyChalkMarkers(markers, text, userChalk) {
  const chalkify = markers
    .trim()
    .split(".")
    .reduce((a, marker) => {
      marker = marker.trim();

      if (a[marker]) {
        // a basic color found
        return a[marker];
      } else if (marker.startsWith("#")) {
        // a hex value
        return a.hex(marker);
      } else if (marker.startsWith("bg#")) {
        // a bgHex value
        return a.bgHex(marker.substr(2));
      }

      const openIx = marker.indexOf("(");
      if (openIx >= 0) {
        // apply other advanced colors when ( is found
        const closeIx = marker.lastIndexOf(")");
        assert(closeIx > openIx, `marker ${marker} missing matching ()`);

        // extract name if there're something before (
        let name = openIx > 0 && marker.substring(0, openIx).trim();

        // extract values within ()
        let values = marker.substring(openIx + 1, closeIx).trim();
        if (values.indexOf(",") >= 0) {
          // extract rgb/hsl/hsv/hwb values like (255, 10, 20)
          values = values.split(",").map(x => parseInt(x.trim(), 10));

          // default no name to rgb, and bg to bgRgb
          if (!name) name = "rgb";
          else if (name === "bg") name = "bgRgb";
        } else {
          // extract a string (with or without quotes) to use for keyword
          values = [deQuote(values.trim(), marker)];

          // default no name to keyword, and bg to bgKeyword
          if (!name) name = "keyword";
          else if (name === "bg") name = "bgKeyword";
        }

        try {
          a = a[name].apply(a, values); // eslint-disable-line
        } catch (err) {
          // istanbul ignore next
          const msg =
            typeof a[name] !== "function"
              ? `${name} is not a chalk function`
              : `calling chalk.${name} failed with: ${err.message}`;

          throw new Error(`marker ${marker} is invalid: ${msg}`);
        }
      } else {
        // if not found as a basic color, then try with chalk.keyword or chalk.bgKeyword
        try {
          const kw = deQuote(marker, marker);
          if (kw.startsWith("bg-") || kw.startsWith("bg ")) {
            a = a.bgKeyword(kw.substring(3));
          } else {
            a = a.keyword(kw);
          }
        } catch (err) {
          throw new Error(`marker ${marker} is not found and invalid as a keyword`);
        }
      }

      assert(a, `marker ${marker} is invalid`);

      return a;
    }, userChalk);

  assert(
    typeof chalkify === "function",
    `final chalk value is not a function after applying ${markers}`
  );

  return chalkify(text);
}

function format(s, userChalk) {
  userChalk = userChalk || chalk;
  return decodeHtml(
    s.replace(/<([\-A-Z 0-9#()'"`,a-z.]+)>([^<]+)($|<\/[^>]*>)/g, (a, b, c) => {
      return applyChalkMarkers(b, c, userChalk);
    })
  );
}

// remove the color marker like <red>text</> from strings
function remove(s) {
  return s.replace(/<[^>]*>/g, "").trim();
}

format.remove = remove;

format.decodeHtml = decodeHtml;

module.exports = format;