import type { SocialPlatform } from "@/content/contact";

import { socialGlyphs } from "./social-glyphs";

interface SocialGlyphIconProps {
  platform: SocialPlatform;
}

export function SocialGlyphIcon({ platform }: Readonly<SocialGlyphIconProps>) {
  const glyph = socialGlyphs[platform];

  if (glyph.kind === "fill") {
    return (
      <svg
        aria-hidden="true"
        className="contact-socials__icon"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d={glyph.path} />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="contact-socials__icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {glyph.shapes.map((shape, index) => {
        const Tag = shape.tag;

        return <Tag key={index} {...shape.attrs} />;
      })}
    </svg>
  );
}
