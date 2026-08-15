"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { ContactContentView } from "@/content/contact";
import { submitContactForm } from "@/features/contact/actions";
import type {
  ContactFieldErrors,
  ContactFieldName,
} from "@/features/contact/validation";

const FIELD_ORDER: ContactFieldName[] = ["name", "email", "subject", "message"];

interface ContactFormProps {
  content: ContactContentView;
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

export function ContactForm({ content }: Readonly<ContactFormProps>) {
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
  const [previousStatus, setPreviousStatus] = useState("idle");

  if (state.status !== previousStatus) {
    setPreviousStatus(state.status);
    if (state.status === "success") {
      setValues({ name: "", email: "", subject: "", message: "" });
    }
  }

  const fieldErrors = (
    state.status === "field-error" ? state.fieldErrors : {}
  ) as ContactFieldErrors;

  const statusMessage = (() => {
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
  }

  return (
    <form
      action={formAction}
      aria-label={content.aria.formLabel}
      className="contact-form"
      noValidate
    >
      <p className="contact-form__required-note">{content.aria.requiredNote}</p>

      {FIELD_ORDER.map((field) => {
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

        if (field === "message") {
          return (
            <div className="contact-form__field" key={field}>
              <label htmlFor={field}>
                {label} <span aria-hidden="true">*</span>
              </label>
              <textarea
                {...commonProps}
                placeholder={placeholder}
                rows={6}
              />
              {errorCode ? (
                <p className="contact-form__error" id={`${field}-error`}>
                  {content.errors[errorCode]}
                </p>
              ) : null}
            </div>
          );
        }

        return (
          <div className="contact-form__field" key={field}>
            <label htmlFor={field}>
              {label} <span aria-hidden="true">*</span>
            </label>
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
            {errorCode ? (
              <p className="contact-form__error" id={`${field}-error`}>
                {content.errors[errorCode]}
              </p>
            ) : null}
          </div>
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
