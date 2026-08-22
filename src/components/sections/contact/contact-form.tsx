"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { ContactContentView } from "@/content/contact";
import { submitContactForm } from "@/features/contact/actions";
import type { SubmitContactResult } from "@/features/contact/submit";
import {
  validateContactSubmission,
  type ContactFieldErrors,
  type ContactFieldName,
} from "@/features/contact/validation";

const FIELD_ROWS: ReadonlyArray<ReadonlyArray<ContactFieldName>> = [
  ["name", "email"],
  ["subject"],
  ["message"],
];

interface ContactFormProps {
  content: ContactContentView;
  labelledById?: string;
}

const initialState = { status: "idle" } as const;

function SubmitButton({ content }: Readonly<{ content: ContactContentView }>) {
  const { pending } = useFormStatus();

  return (
    <button
      className="contact-form__submit"
      disabled={pending}
      type="submit"
    >
      {pending ? content.form.submitting : content.form.submit}
    </button>
  );
}

export function ContactForm({
  content,
  labelledById,
}: Readonly<ContactFormProps>) {
  const [state, formAction] = useActionState(
    submitContactForm,
    initialState,
  );
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [lastState, setLastState] = useState<SubmitContactResult>(initialState);

  if (state !== lastState) {
    setLastState(state);
    if (state.status === "success") {
      setValues({ name: "", email: "", subject: "", message: "" });
      setFieldErrors({});
    } else if (state.status === "field-error") {
      setFieldErrors(state.fieldErrors);
    } else {
      setFieldErrors({});
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  const statusMessage = (() => {
    if (hasFieldErrors) {
      return "";
    }
    switch (state.status) {
      case "success":
        return content.status.success;
      case "rejected":
        return content.status.rejected;
      case "rate-limited":
        return content.status.rateLimited;
      case "server-error":
        return content.status.serverError;
      default:
        return "";
    }
  })();

  function handleChange(field: ContactFieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (current[field] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const errors = validateContactSubmission(values);
    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      setFieldErrors(errors);
    } else {
      setFieldErrors({});
    }
  }

  return (
    <form
      action={formAction}
      aria-labelledby={labelledById}
      className="contact-form"
      noValidate
      onSubmit={handleSubmit}
    >
      <p className="contact-form__required-note">{content.aria.requiredNote}</p>

      {FIELD_ROWS.map((row) => {
        const fields = row.map((field) => {
          const label = content.form[field];
          const placeholder = content.form[`${field}Placeholder`];
          const errorCode = fieldErrors[field];
          const describedBy = errorCode ? `${field}-error` : undefined;

          const commonProps = {
            "aria-describedby": describedBy,
            "aria-invalid": errorCode ? true : undefined,
            id: field,
            name: field,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => handleChange(field, event.target.value),
            required: true,
            value: values[field],
          };

          return (
            <div className="contact-form__field" key={field}>
              <label htmlFor={field}>
                {label} <span aria-hidden="true">*</span>
              </label>
              {field === "message" ? (
                <textarea
                  {...commonProps}
                  placeholder={placeholder}
                  rows={4}
                />
              ) : (
                <input
                  {...commonProps}
                  autoComplete={
                    field === "email"
                      ? "email"
                      : field === "name"
                        ? "name"
                        : "off"
                  }
                  placeholder={placeholder}
                  type={field === "email" ? "email" : "text"}
                />
              )}
              {errorCode ? (
                <p className="contact-form__error" id={`${field}-error`}>
                  {content.errors[errorCode]}
                </p>
              ) : null}
            </div>
          );
        });

        return row.length > 1 ? (
          <div className="contact-form__row" key={row.join("-")}>
            {fields}
          </div>
        ) : (
          fields
        );
      })}

      <div className="contact-form__honeypot" aria-hidden="true">
        <label htmlFor="website">{content.aria.honeypot}</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="contact-form__actions">
        <SubmitButton content={content} />
      </div>

      {statusMessage ? (
        <p
          aria-live="polite"
          className={`contact-form__status contact-form__status--${state.status}`}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
