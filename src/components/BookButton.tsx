"use client";

export type BookKind = "stay" | "dining" | "event";

export function openBook(detail: { kind: BookKind; room?: string }) {
  window.dispatchEvent(new CustomEvent("ag:book", { detail }));
}

type Props = {
  kind?: BookKind;
  room?: string;
  className?: string;
  children: React.ReactNode;
};

/** Opens the booking sheet. Works as a plain button so it is keyboard and screen-reader friendly. */
export function BookButton({ kind = "stay", room, className = "btn", children }: Props) {
  return (
    <button type="button" className={className} onClick={() => openBook({ kind, room })} aria-haspopup="dialog">
      {children}
    </button>
  );
}
