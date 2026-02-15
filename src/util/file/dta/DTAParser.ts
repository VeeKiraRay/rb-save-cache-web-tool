// ============================================================
// DTA (Harmonix Data Array) Parser for TypeScript
// ============================================================
// Parses the S-expression format used by Rock Band .dta files
// into structured TypeScript objects.
//
// Format overview:
//   (key
//      (prop1 value1)
//      (prop2 "string value")
//      (nested
//         (child1 42)
//         (child2 (1 2 3))
//      )
//   )
//
// Strategy:
//   1. Tokenize: split into (, ), quoted strings, and bare words/numbers
//   2. Parse:    recursive descent over the token stream
//   3. Convert:  map the raw tree into keyed objects
// ============================================================

import type DtaEntry from "@/types/file/dta/DtaEntry";
import type { DtaValue as DTAValue } from "@/types/file/dta/DtaValue";
import type { SFormat } from "@/types/file/dta/SFormat";

// -- Internal marker for comment tokens ----------------------

const COMMENT_PREFIX = "\0COMMENT:";

function isCommentToken(s: SFormat): s is string {
  return typeof s === "string" && s.startsWith(COMMENT_PREFIX);
}

function getCommentText(s: string): string {
  return s.slice(COMMENT_PREFIX.length);
}

// -- Step 1: Tokenizer ---------------------------------------

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Line comment → emit as tagged token (not discarded)
    if (ch === ";") {
      let line = "";
      i++; // skip the ;
      while (i < input.length && input[i] !== "\n") {
        line += input[i];
        i++;
      }
      tokens.push(COMMENT_PREFIX + line.trim());
      continue;
    }

    // Parens are single-character tokens
    if (ch === "(" || ch === ")") {
      tokens.push(ch);
      i++;
      continue;
    }

    // Double-quoted string → preserved as quoted token
    if (ch === '"') {
      let str = "";
      i++; // skip opening quote
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          str += input[i + 1];
          i += 2;
        } else {
          str += input[i];
          i++;
        }
      }
      i++; // skip closing quote
      tokens.push(`"${str}"`);
      continue;
    }

    // Single-quoted symbol → strip quotes, treat as bare identifier
    if (ch === "'") {
      let str = "";
      i++; // skip opening quote
      while (i < input.length && input[i] !== "'") {
        str += input[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push(str);
      continue;
    }

    // Bare word / number (anything until whitespace, paren, or quote)
    let word = "";
    while (i < input.length && !/[\s()'"]/.test(input[i])) {
      word += input[i];
      i++;
    }
    if (word) tokens.push(word);
  }

  return tokens;
}

// -- Step 2: S-Expression Parser -----------------------------

function parseSFormats(tokens: string[]): SFormat[] {
  let pos = 0;

  function parseOne(): SFormat {
    const token = tokens[pos];

    if (token === "(") {
      pos++; // skip '('
      const list: SFormat[] = [];
      while (pos < tokens.length && tokens[pos] !== ")") {
        list.push(parseOne());
      }
      pos++; // skip ')'
      return list;
    }

    pos++;

    // Comment token → pass through with marker intact
    if (token.startsWith(COMMENT_PREFIX)) {
      return token;
    }
    // Double-quoted string → strip quotes
    if (token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1);
    }
    // Try numeric
    const num = Number(token);
    if (!isNaN(num) && token !== "") {
      return num;
    }
    // Bare symbol / identifier
    return token;
  }

  const results: SFormat[] = [];
  while (pos < tokens.length) {
    results.push(parseOne());
  }
  return results;
}

// -- Step 3: Convert raw S-expressions → DTAEntry[] ----------

/**
 * Check if a single S-expression item looks like a keyed pair:
 * a list whose first element is a string (identifier), not a comment.
 */
function isKeyedItem(item: SFormat): item is [string, ...SFormat[]] {
  return (
    Array.isArray(item) &&
    item.length >= 1 &&
    typeof item[0] === "string" &&
    !isCommentToken(item[0])
  );
}

/**
 * Heuristic: does this list look like a block of key-value pairs?
 * We require that MOST non-comment items (>50%) are keyed sub-lists.
 */
function isKeyValueBlock(list: SFormat[]): boolean {
  const nonComments = list.filter((item) => !isCommentToken(item));
  if (nonComments.length === 0) return false;
  const keyedCount = nonComments.filter((item) => isKeyedItem(item)).length;
  return keyedCount > 0 && keyedCount / nonComments.length > 0.5;
}

function convertValue(expr: SFormat): DTAValue {
  if (typeof expr === "string" || typeof expr === "number") {
    return expr;
  }

  if (!Array.isArray(expr)) return String(expr);

  if (isKeyValueBlock(expr)) {
    return convertBlock(expr);
  }

  return expr
    .filter((item) => !isCommentToken(item))
    .map((item) => convertValue(item));
}

function convertBlock(items: SFormat[]): Record<string, DTAValue> {
  const obj: Record<string, DTAValue> = {};

  for (const item of items) {
    if (isCommentToken(item)) continue;
    if (!isKeyedItem(item)) continue;

    const key = item[0];

    if (item.length === 1) {
      obj[key] = true;
    } else if (item.length === 2) {
      obj[key] = convertValue(item[1]);
    } else {
      const rest = item.slice(1);
      if (isKeyValueBlock(rest)) {
        obj[key] = convertBlock(rest);
      } else {
        obj[key] = rest.map((v) => convertValue(v));
      }
    }
  }

  return obj;
}

// -- Step 4: Parse comment lines → meta object ---------------

/**
 * Convert a string like "PartialMultitrack" to "partialMultitrack".
 * Handles spaces, parentheses in keys like "Language(s)",
 * and acronyms like "DIYStems" → "diyStems", "CATemh" → "caTemh".
 */
function toCamelCase(str: string): string {
  // Remove characters that aren't alphanumeric or spaces
  const cleaned = str.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const words = cleaned.split(/\s+/);
  return words
    .map((w, i) => {
      if (i === 0) {
        // Lowercase leading acronym: "DIYStems" → "diyStems", "CATemh" → "caTemh"
        const leadingCaps = w.match(/^[A-Z]+/);
        if (leadingCaps && leadingCaps[0].length > 1) {
          const acronym = leadingCaps[0];
          // If the entire word is caps, lowercase it all
          if (acronym.length === w.length) return w.toLowerCase();
          // Otherwise lowercase just the acronym portion (keep last cap for next segment)
          return (
            acronym.slice(0, -1).toLowerCase() + w.slice(acronym.length - 1)
          );
        }
        return w.charAt(0).toLowerCase() + w.slice(1);
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}

/**
 * Try to parse a value string into number or boolean, else keep as string.
 */
function parseMetaValue(raw: string): DTAValue {
  const trimmed = raw.trim().replace(/,+$/, ""); // strip trailing commas
  if (trimmed === "") return true; // bare flag
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") return num;
  return trimmed;
}

/**
 * Parse collected comment strings into a meta record.
 * Supports delimiters: =, :, " by ", " authored by "
 * Skips the "DO NOT EDIT" header line.
 */
function parseComments(
  comments: string[],
): Record<string, DTAValue> | undefined {
  const meta: Record<string, DTAValue> = {};
  let hasEntries = false;

  for (const line of comments) {
    // Skip the "DO NOT EDIT" header
    if (/^DO NOT EDIT/i.test(line)) continue;

    // Try splitting by "=" first (most common)
    const eqIdx = line.indexOf("=");
    if (eqIdx !== -1) {
      const key = toCamelCase(line.slice(0, eqIdx));
      const val = parseMetaValue(line.slice(eqIdx + 1));
      if (key) {
        meta[key] = val;
        hasEntries = true;
      }
      continue;
    }

    // Try splitting by " by " (last occurrence, so "Song authored by X"
    // gives key="Song authored" → "songAuthored", value="X")
    const byIdx = line.lastIndexOf(" by ");
    if (byIdx !== -1) {
      const key = toCamelCase(line.slice(0, byIdx));
      const val = parseMetaValue(line.slice(byIdx + 4));
      if (key) {
        meta[key] = val;
        hasEntries = true;
      }
      continue;
    }

    // Try splitting by ":" (e.g. "Created using Magma: Rok On Edition v4.0.3")
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = toCamelCase(line.slice(0, colonIdx));
      const val = parseMetaValue(line.slice(colonIdx + 1));
      if (key) {
        meta[key] = val;
        hasEntries = true;
      }
      continue;
    }
  }
  return hasEntries ? meta : undefined;
}

// -- Entry assembly ------------------------------------------

function sexprToEntry(expr: SFormat): DtaEntry | null {
  if (!Array.isArray(expr) || expr.length < 2) return null;

  const id = String(expr[0]);
  const body = expr.slice(1);

  // Extract comment lines from the body
  const comments: string[] = [];
  const dataItems: SFormat[] = [];

  for (const item of body) {
    if (isCommentToken(item)) {
      comments.push(getCommentText(item));
    } else {
      dataItems.push(item);
    }
  }

  const props = convertBlock(dataItems);
  const meta = parseComments(comments);
  const entry: DtaEntry = { id, props };
  if (meta) entry.meta = meta;
  return entry;
}

// -- Public API ----------------------------------------------

/**
 * Parse a .dta file string into an array of DTAEntry objects.
 * Works for files with one entry or many, and supports both
 * bare-word and single-quoted key formats.
 * Trailing ;comment metadata is parsed into entry.meta.
 *
 * @example
 * const text = fs.readFileSync("songs.dta", "utf-8");
 * const entries = parseDTA(text);
 * console.log(entries[0].id);            // "20thcenturyboy"
 * console.log(entries[0].props.name);     // "20th Century Boy"
 * console.log(entries[0].props.artist);   // "T. Rex"
 * console.log(entries[0].meta);           // undefined (no comments)
 */
export function parseDTA(input: string): DtaEntry[] {
  const tokens = tokenize(input);
  const sexprs = parseSFormats(tokens);
  const entries: DtaEntry[] = [];

  for (const expr of sexprs) {
    const entry = sexprToEntry(expr);
    if (entry) entries.push(entry);
  }

  return entries;
}

/**
 * Convenience: parse and return a keyed record { [id]: props }.
 * Handy when you want to look up songs by shortname.
 * Note: meta is not included in this view — use parseDTA() for full access.
 */
export function parseDTAToMap(
  input: string,
): Record<string, Record<string, DTAValue>> {
  const entries = parseDTA(input);
  const map: Record<string, Record<string, DTAValue>> = {};
  for (const entry of entries) {
    map[entry.id] = { props: entry.props, meta: entry.meta };
  }
  return map;
}

const DTAParser = {
  parseDTA,
  parseDTAToMap,
};

export default DTAParser;
