"use client";

import { useState } from "react";

import type { FooterContentView } from "@/content/footer";
import {
  validateNewsletterSignup,
  type NewsletterFieldErrors,
} from "@/features/newsletter/validation";

interface NewsletterFormProps {
  content: FooterContentView;
}

export function NewsletterForm({ content }: Readonly<NewsletterFormProps>) {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const newsletter = content.newsletter;

  function handleChange(value: string) {
    setEmail(value);
    setSubmitted(false);
    if (fieldError) {
      setFieldError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: NewsletterFieldErrors = validateNewsletterSignup({ email });
    const code = errors.email ?? null;

    setSubmitted(false);
    setFieldError(code ? newsletter.errors[code] : null);

    if (!code) {
      setSubmitted(true);
    }
  }

  return (
    <form
      aria-label={newsletter.aria.formLabel}
      className="newsletter-form"
      noValidate
      onSubmit={handleSubmit}
    >
      <p className="newsletter-form__description">{newsletter.description}</p>
      <p className="newsletter-form__helper">{newsletter.helper}</p>

      <div className="newsletter-form__field">
        <label htmlFor="newsletter-email">{newsletter.aria.emailLabel}</label>
        <input
          aria-describedby={fieldError ? "newsletter-email-error" : undefined}
          aria-invalid={fieldError ? true : undefined}
          autoComplete="email"
          id="newsletter-email"
          name="email"
          onChange={(event) => handleChange(event.target.value)}
          placeholder={newsletter.placeholder}
          required
          type="email"
          value={email}
        />
        {fieldError ? (
          <p className="newsletter-form__error" id="newsletter-email-error">
            {fieldError}
          </p>
        ) : null}
      </div>

      <button className="newsletter-form__submit" type="submit">
        {newsletter.submit}
      </button>

      {submitted ? (
        <p
          aria-live="polite"
          className="newsletter-form__status"
          role="status"
        >
          {newsletter.unavailable}
        </p>
      ) : null}
    </form>
  );
}
