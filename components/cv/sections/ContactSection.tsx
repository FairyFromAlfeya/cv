import type { FormEventHandler } from "react";
import type { Dictionary } from "@/components/cv/config";
import type { ContactFormStatus } from "@/components/cv/types";
import { CvSection } from "@/components/cv/ui/CvSection";

type ContactSectionProps = {
  copy: Dictionary["contact"];
  status: ContactFormStatus;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onStart: () => void;
  onInvalid: FormEventHandler<HTMLFormElement>;
};

export function ContactSection({ copy, status, onSubmit, onStart, onInvalid }: ContactSectionProps) {
  const isSubmitting = status === "submitting";
  const statusMessage =
    status === "submitting"
      ? copy.sendingStatus
      : status === "success"
        ? copy.successStatus
        : status === "error"
          ? copy.errorStatus
          : "";

  return (
    <CvSection id="contact">
      <div className="contact-content absolute left-[18.8vw] top-[18vh] z-10 w-[62.4vw]">
        <h2 className="h-[10vh] text-[clamp(20px,2.067vw,31px)] font-semibold uppercase leading-[1.4]">
          {copy.title}
        </h2>
        <form
          onSubmit={onSubmit}
          onFocusCapture={onStart}
          onInputCapture={onStart}
          onInvalidCapture={onInvalid}
          className="ym-disable-submit ym-hide-content mt-[8vh]"
          aria-label={copy.formLabel}
          aria-busy={isSubmitting}
        >
          <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" className="ym-disable-keys" />
          </div>
          <div className="grid grid-cols-2 gap-[1.6vw]">
            <label className="sr-only" htmlFor="name">{copy.name}</label>
            <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder={copy.name} className="ym-disable-keys h-10 bg-[#333] px-2 text-[clamp(10px,.8vw,12px)] outline-none transition-shadow focus:shadow-[inset_0_-2px_0_#f3ca2f]" />
            <label className="sr-only" htmlFor="email">{copy.email}</label>
            <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder={copy.email} className="ym-disable-keys h-10 bg-[#333] px-2 text-[clamp(10px,.8vw,12px)] outline-none transition-shadow focus:shadow-[inset_0_-2px_0_#f3ca2f]" />
          </div>
          <label className="sr-only" htmlFor="subject">{copy.subject}</label>
          <input id="subject" name="subject" maxLength={150} placeholder={copy.subject} className="ym-disable-keys mt-6 h-10 w-full bg-[#333] px-2 text-[clamp(10px,.8vw,12px)] outline-none transition-shadow focus:shadow-[inset_0_-2px_0_#f3ca2f]" />
          <label className="sr-only" htmlFor="message">{copy.message}</label>
          <textarea id="message" name="message" required maxLength={5000} placeholder={copy.message} className="ym-disable-keys mt-6 h-40 w-full resize-none bg-[#333] p-2 text-[clamp(10px,.8vw,12px)] outline-none transition-shadow focus:shadow-[inset_0_-2px_0_#f3ca2f]" />
          <div className="mt-10 flex items-center gap-5">
            <button type="submit" disabled={isSubmitting} className="h-10 w-24 cursor-pointer bg-black text-[clamp(10px,.8vw,12px)] font-medium transition-colors hover:bg-[#f3ca2f] hover:text-black disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? copy.sending : copy.send}
            </button>
            <p
              className={`text-xs ${status === "error" ? "text-red-300" : "text-[#f3ca2f]"}`}
              role={status === "error" ? "alert" : "status"}
            >
              {statusMessage}
            </p>
          </div>
        </form>
      </div>
    </CvSection>
  );
}
