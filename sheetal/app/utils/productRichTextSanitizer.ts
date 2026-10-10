import DOMPurify from "dompurify";

const allowedTags = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sup",
  "sub",
  "mark",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "hr",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "span",
  "div",
  "label",
  "input",
];

const allowedAttributes = [
  "href",
  "name",
  "target",
  "rel",
  "title",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "class",
  "style",
  "colspan",
  "rowspan",
  "scope",
  "data-type",
  "data-checked",
  "type",
  "checked",
  "disabled",
];

const sanitizerConfig = {
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: allowedAttributes,
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "textarea",
    "select",
    "option",
  ],
  // DOMPurify's default safely blocks javascript:, vbscript:, and other dangerous schemes
  // while allowing https://, http://, mailto:, tel:, relative paths, and anchor links
};

export const sanitizeProductRichText = (value: string) => {
  if (typeof value !== "string" || !value.trim()) return "";
  return DOMPurify.sanitize(value, sanitizerConfig);
};