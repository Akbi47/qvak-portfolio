import type { SocialPlatform } from "@/content/contact";

import { detailGlyphs, socialGlyphs, type SocialGlyph } from "./social-glyphs";

interface GlyphSvgProps {
  className?: string;
  glyph: SocialGlyph;
}

export function GlyphSvg({ className, glyph }: Readonly<GlyphSvgProps>) {
  if (glyph.kind === "fill") {
    return (
      <svg
        aria-hidden="true"
        className={className}
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
      className={className}
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

interface SocialGlyphIconProps {
  platform: SocialPlatform;
}

export function SocialGlyphIcon({ platform }: Readonly<SocialGlyphIconProps>) {
  return (
    <GlyphSvg
      className="contact-socials__icon"
      glyph={socialGlyphs[platform]}
    />
  );
}

export function DetailGlyphIcon({
  className = "contact-detail__icon",
  id,
}: Readonly<{ className?: string; id: string }>) {
  const glyph = detailGlyphs[id];

  if (!glyph) {
    return <DetailLinkGlyph className={className} />;
  }

  return <GlyphSvg className={className} glyph={glyph} />;
}

function DetailLinkGlyph({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
