import type { SocialPlatform } from "@/content/contact";

interface StrokeShape {
  readonly tag: "path" | "rect" | "circle" | "line";
  readonly attrs: Readonly<Record<string, string>>;
}

type SocialGlyph =
  | { readonly kind: "stroke"; readonly shapes: ReadonlyArray<StrokeShape> }
  | { readonly kind: "fill"; readonly path: string };

export type { SocialGlyph };

/**
 * Lucide glyphs (ISC license) matching the mdrakibali.me reference, plus the
 * official X mark (Simple Icons, CC0) rendered filled.
 */
export const socialGlyphs: Readonly<Record<SocialPlatform, SocialGlyph>> = {  facebook: {
    kind: "stroke",
    shapes: [
      {
        attrs: {
          d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
        },
        tag: "path",
      },
    ],
  },
  github: {
    kind: "stroke",
    shapes: [
      {
        attrs: {
          d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
        },
        tag: "path",
      },
      { attrs: { d: "M9 18c-4.51 2-5-2-7-2" }, tag: "path" },
    ],
  },
  instagram: {
    kind: "stroke",
    shapes: [
      {
        attrs: { height: "20", rx: "5", ry: "5", width: "20", x: "2", y: "2" },
        tag: "rect",
      },
      {
        attrs: {
          d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
        },
        tag: "path",
      },
      { attrs: { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5" }, tag: "line" },
    ],
  },
  linkedin: {
    kind: "stroke",
    shapes: [
      {
        attrs: {
          d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
        },
        tag: "path",
      },
      { attrs: { height: "12", width: "4", x: "2", y: "9" }, tag: "rect" },
      { attrs: { cx: "4", cy: "4", r: "2" }, tag: "circle" },
    ],
  },
  x: {
    kind: "fill",
    path:
      "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  },
};

/**
 * Lucide glyphs (ISC license) for the contact-detail rows: mail, phone and
 * map-pin, keyed by `ContactDetailView.id`.
 */
export const detailGlyphs: Readonly<Record<string, SocialGlyph>> = {
  email: {
    kind: "stroke",
    shapes: [
      {
        attrs: {
          height: "16",
          rx: "2",
          width: "20",
          x: "2",
          y: "4",
        },
        tag: "rect",
      },
      {
        attrs: { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" },
        tag: "path",
      },
    ],
  },
  location: {
    kind: "stroke",
    shapes: [
      {
        attrs: { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" },
        tag: "path",
      },
      { attrs: { cx: "12", cy: "10", r: "3" }, tag: "circle" },
    ],
  },
  phone: {
    kind: "stroke",
    shapes: [
      {
        attrs: {
          d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        },
        tag: "path",
      },
    ],
  },
};
