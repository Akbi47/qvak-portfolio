"use client";

import Image from "next/image";
import {
  type PointerEvent,
  type TouchEvent,
  useRef,
  useState,
} from "react";

import type { PortfolioProfileView } from "@/content/profile";
import type { AboutSliderMessages } from "@/features/i18n/messages/types";

interface PortraitSliderProps {
  messages: AboutSliderMessages;
  portraits: PortfolioProfileView["about"]["portraits"];
}

const swipeThreshold = 40;

export function PortraitSlider({
  messages,
  portraits,
}: Readonly<PortraitSliderProps>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  function showSlide(index: number) {
    setActiveIndex((index + portraits.length) % portraits.length);
  }

  function finishSwipe(endX: number) {
    if (pointerStartX.current === null) {
      return;
    }

    const distance = endX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(distance) >= swipeThreshold) {
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    pointerStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    finishSwipe(event.clientX);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    pointerStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const endX = event.changedTouches[0]?.clientX;

    if (endX !== undefined) {
      finishSwipe(endX);
    }
  }

  return (
    <div aria-label={messages.label} className="portrait-slider" role="region">
      <div
        className="portrait-slider__viewport"
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          pointerStartX.current = null;
        }}
        onTouchStart={handleTouchStart}
      >
        <div
          className="portrait-slider__track"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {portraits.map((portrait, index) => (
            <div
              aria-hidden={index !== activeIndex}
              className="portrait-slider__slide"
              key={portrait.src}
            >
              <Image
                alt={index === activeIndex ? portrait.alt : ""}
                className="portrait-slider__image"
                draggable={false}
                height={portrait.height}
                sizes="(min-width: 64rem) 38vw, (min-width: 48rem) 66vw, calc(100vw - 3rem)"
                src={portrait.src}
                style={{ objectPosition: portrait.focalPoint }}
                width={portrait.width}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="portrait-slider__controls">
        <button
          aria-label={messages.previous}
          className="portrait-slider__arrow"
          onClick={() => showSlide(activeIndex - 1)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            viewBox="0 0 24 24"
            width="20"
          >
            <path
              d="m15 6-6 6 6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="portrait-slider__dots">
          {portraits.map((portrait, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              aria-label={`${messages.goToSlide} ${index + 1}`}
              className="portrait-slider__dot"
              key={portrait.src}
              onClick={() => showSlide(index)}
              type="button"
            />
          ))}
        </div>

        <p aria-live="polite" className="portrait-slider__status">
          <span className="sr-only">{messages.portrait} </span>
          {activeIndex + 1} {messages.of} {portraits.length}
        </p>

        <button
          aria-label={messages.next}
          className="portrait-slider__arrow"
          onClick={() => showSlide(activeIndex + 1)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            viewBox="0 0 24 24"
            width="20"
          >
            <path
              d="m9 6 6 6-6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
