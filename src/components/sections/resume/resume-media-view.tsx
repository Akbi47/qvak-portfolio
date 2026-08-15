"use client";

import Image from "next/image";
import { useState } from "react";

import type { ResumeMediaView as ResumeMediaViewData } from "@/content/resume";
import { Lightbox } from "@/features/lightbox/lightbox";

interface ResumeMediaViewProps {
  media: ReadonlyArray<ResumeMediaViewData>;
  viewImageLabel: string;
  closeLabel: string;
  lightboxLabel: string;
}

export function ResumeMediaView({
  media,
  viewImageLabel,
  closeLabel,
  lightboxLabel,
}: Readonly<ResumeMediaViewProps>) {
  const [activeMedia, setActiveMedia] = useState<ResumeMediaViewData | null>(
    null,
  );

  const close = () => setActiveMedia(null);

  return (
    <div className="resume-media">
      {media.map((item) => (
        <figure className="resume-media__item" key={item.id}>
          <div className="resume-media__thumbnail">
            <Image
              alt={item.alt}
              className="resume-media__thumbnail-image"
              fill
              sizes="(min-width: 64rem) 18vw, 92vw"
              src={item.thumbnailSrc}
              style={{ objectFit: "cover" }}
            />
          </div>
          {item.caption ? (
            <figcaption className="resume-media__caption">
              {item.caption}
            </figcaption>
          ) : null}
          <button
            aria-haspopup="dialog"
            className="resume-media__view"
            onClick={() => setActiveMedia(item)}
            type="button"
          >
            {viewImageLabel}
          </button>
        </figure>
      ))}

      <Lightbox
        closeLabel={closeLabel}
        label={lightboxLabel}
        onClose={close}
        open={activeMedia !== null}
      >
        {activeMedia ? (
          <figure className="lightbox-content">
            <div
              className="lightbox-content__frame"
              data-aspect={
                activeMedia.width && activeMedia.height ? "true" : "false"
              }
              style={
                activeMedia.width && activeMedia.height
                  ? { aspectRatio: `${activeMedia.width} / ${activeMedia.height}` }
                  : undefined
              }
            >
              <Image
                alt={activeMedia.alt}
                className="lightbox-content__image"
                fill
                sizes="(min-width: 64rem) 80vw, 100vw"
                src={activeMedia.fullSrc}
                style={{ objectFit: "contain" }}
              />
            </div>
            {activeMedia.caption ? (
              <figcaption className="lightbox-content__caption">
                {activeMedia.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </Lightbox>
    </div>
  );
}
