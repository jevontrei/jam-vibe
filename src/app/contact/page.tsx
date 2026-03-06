"use client";

import { useActionState } from "react";
import { submitContact, type ContactResult } from "./actions";

export default function ContactPage() {
  const [state, formAction, pending] = useActionState<ContactResult | null, FormData>(
    submitContact,
    null
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
        Contact
      </h1>
      <p className="mb-8 leading-relaxed text-zinc-700">
        Want your residency listed? Got a correction, feedback, or just want to
        say g&apos;day? Drop us a line.
      </p>

      {state?.success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Name</span>
            <input
              name="name"
              type="text"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-700">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              maxLength={5000}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </label>

          {state && !state.success && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {pending ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </main>
  );
}
