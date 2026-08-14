"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProjectMediaView } from "@/content/projects";

interface ProjectMediaCarouselProps {
  media: ReadonlyArray<ProjectMediaView>;
  previousLabel: string;
  nextLabel: string;
  imageLabel: string;
}

export function ProjectMediaCarousel({
  media,
  previousLabel,
  nextLabel,
  imageLabel,
}: Readonly<ProjectMediaCarouselProps>) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 1) {
    const [single] = media;
    return (
      <div className="project-media project-media--single">
        <Image
          alt={single.alt}
          className="project-media__image"
          fill
          sizes="(min-width: 64rem) 42vw, 90vw"
          src={single.src}
          style={{ objectPosition: single.focalPoint }}
        />
      </div>
    );
  }

  const goToSlide = (index: number) => {
    setActiveIndex((index + media.length) % media.length);
  };

  return (
    <div
      aria-label={imageLabel}
      aria-roledescription="carousel"
      className="project-carousel"
      role="group"
    >
      <div
        className="project-carousel__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {media.map((item) => (
          <div className="project-carousel__slide" key={item.id}>
            <Image
              alt={item.alt}
              className="project-carousel__image"
              fill
              sizes="(min-width: 64rem) 42vw, 90vw"
              src={item.src}
              style={{ objectPosition: item.focalPoint }}
            />
          </div>
        ))}
      </div>

      <div className="project-carousel__controls">
        <button
          aria-label={previousLabel}
          className="project-carousel__arrow"
          onClick={() => goToSlide(activeIndex - 1)}
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
            <path
              d="m14 6-6 6 6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>

        <div className="project-carousel__dots">
          {media.map((item, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`${imageLabel} ${index + 1}`}
              className="project-carousel__dot"
              key={item.id}
              onClick={() => goToSlide(index)}
              type="button"
            />
          ))}
        </div>

        <button
          aria-label={nextLabel}
          className="project-carousel__arrow"
          onClick={() => goToSlide(activeIndex + 1)}
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
            <path
              d="m10 6 6 6-6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {imageLabel} {activeIndex + 1} / {media.length}
      </div>
    </div>
  );
}
