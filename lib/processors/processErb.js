const cache = {};
const fixedCache = {};
const outputLogs = true;

function log(...args) {
  if (outputLogs) console.log(...args);
}

function coordsToIndex(text, line, column) {
  let lines = text.split('\n');
  lines = lines.slice(0, line - 1);
  let characters = lines.reduce((acu, cur) => acu + cur.length, 0);
  // log(lines, characters);
  characters += line + column - 2;
  return characters;
}

function indexToCoords(text, index) {
  log('getting coords from', index, text.length);
  if (index >= text.length) {
    log('Padding text...');
    text += ' '.repeat(index - text.length + 1);
  }
  let cut = text.substring(0, index + 1);
  let lines = cut.split('\n');
  log(JSON.stringify(lines[lines.length - 1]));
  return { line: lines.length, column: lines[lines.length - 1].length }
}

module.exports = {
  preprocess: function (text, filename) {
    cache[filename] = text;
    text = text
      .replace(/^([\t ]*?)<%(.+?)[\t ]*%>$/gm, '$1// $2')
      .replace(/^([\t ]*?)<%$/gm, '$1/*')
      .replace(/^([\t ]*?)<%/gm, '$1/* ')
      .replace(/[\t ]*%>([\t ]*?)$/gm, ' */$1');

    log(filename, text);
    fixedCache[filename] = text;

    return [text];
  },
  postprocess: function (messages, filename) {
    for (const message of messages) {
      // var rangeCache = [];
      let fixed = false;
      for (const rule of message) {
        log(rule);
        if (rule.fix) {
          if (fixed) {
            rule.fix = null;
            continue;
          }
          fixed = true;
          // let r = rule.fix.range;
          // if (rangeCache.find(c => (r[0] >= c[0] && r[0] <= c[1]) || (r[1] >= c[1] && r[1] <= c[1]))) {
          //   log('This location has already been touched, skipping...');
          //   rule.fix = null;
          //   continue;
          // };
          // rangeCache.push(r);

          let diff = rule.fix.range[1] - rule.fix.range[0];

          let startPos = indexToCoords(fixedCache[filename], rule.fix.range[0]);
          let endPos = indexToCoords(fixedCache[filename], rule.fix.range[1]);
          // log(pos);

          log('Fixed index:', startPos, endPos);

          let startPos2 = coordsToIndex(cache[filename], startPos.line, startPos.column);
          let endPos2 = coordsToIndex(cache[filename], endPos.line, endPos.column);
          log('Cache coord:', startPos2, endPos2);

          let a = indexToCoords(cache[filename], startPos2);
          let b = indexToCoords(cache[filename], endPos2);
          log('Cache index:', a, b);
          // log(characters);

          rule.fix.range = [startPos2, endPos2];

          log(rule.fix.range);
        }
      }
    }
    return messages[0];
  },
  supportsAutofix: true
};