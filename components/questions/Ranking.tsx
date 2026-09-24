"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useState } from "react";
import type { Option, RankingQ } from "@/lib/types";
import { SubmitButton, type QProps } from "./shared";

export function Ranking({ q, locale, t, answer, revealed, onAnswer }: QProps<RankingQ>) {
  const [order, setOrder] = useState<string[]>(answer && "order" in answer ? answer.order : q.items.map((i) => i.id));
  const [moved, setMoved] = useState(Boolean(answer));
  const byId = new Map(q.items.map((i) => [i.id, i]));
  // id stable entre serveur et client (évite un décalage d'hydratation des attributs aria de dnd-kit).
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    setOrder((o) => arrayMove(o, from, to));
    setMoved(true);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) move(order.indexOf(String(active.id)), order.indexOf(String(over.id)));
  };

  return (
    <>
      {q.topLabel && <p className="mb-2 text-sm font-semibold text-muted">▲ {q.topLabel[locale]}</p>}
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="grid gap-2">
            {order.map((id, i) => (
              <Row
                key={id}
                item={byId.get(id)!}
                index={i}
                count={order.length}
                locale={locale}
                disabled={revealed}
                status={revealed && q.correct ? (q.correct[i] === id ? "ok" : "ko") : undefined}
                labels={{ up: t.flow.moveUp, down: t.flow.moveDown }}
                onMove={move}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {q.bottomLabel && <p className="mt-2 text-sm font-semibold text-muted">▼ {q.bottomLabel[locale]}</p>}
      {!revealed && (
        <>
          <p className="mt-3 text-center text-sm text-muted">{t.flow.dragHint}</p>
          <SubmitButton t={t} disabled={!moved} onClick={() => onAnswer({ order })} />
        </>
      )}
    </>
  );
}

function Row({
  item,
  index,
  count,
  locale,
  disabled,
  status,
  labels,
  onMove,
}: {
  item: Option;
  index: number;
  count: number;
  locale: "fr" | "en";
  disabled: boolean;
  status?: "ok" | "ko";
  labels: { up: string; down: string };
  onMove: (from: number, to: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex min-h-14 items-center gap-2 rounded-2xl border-2 bg-surface py-1.5 pr-1.5 pl-1.5 sm:gap-3 sm:pr-3 ${
        isDragging ? "relative z-10 border-brand shadow-lg" : "border-line"
      } ${status === "ok" ? "border-good! bg-good-soft" : status === "ko" ? "border-bad! bg-bad-soft" : ""}`}
    >
      {/* Poignée de glisser-déposer : numéro + libellé */}
      <div
        ref={setActivatorNodeRef}
        className={`flex flex-1 touch-manipulation items-center gap-2 self-stretch rounded-xl px-1.5 outline-none focus-visible:ring-4 focus-visible:ring-brand/30 sm:gap-3 ${
          disabled ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        {...attributes}
        {...listeners}
      >
        {!disabled && <span className="text-muted" aria-hidden>⠿</span>}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-bold sm:h-8 sm:w-8">
          {index + 1}
        </span>
        {item.emoji && <span className="text-xl sm:text-2xl" aria-hidden>{item.emoji}</span>}
        <span className="flex-1 text-[0.95rem] leading-snug font-medium sm:text-base">{item.label[locale]}</span>
        {status && <span aria-hidden>{status === "ok" ? "✅" : "❌"}</span>}
      </div>
      {!disabled && (
        <div className="flex shrink-0 gap-1">
          <ArrowBtn label={labels.up} disabled={index === 0} onClick={() => onMove(index, index - 1)}>↑</ArrowBtn>
          <ArrowBtn label={labels.down} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>↓</ArrowBtn>
        </div>
      )}
    </li>
  );
}

function ArrowBtn({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-base hover:bg-surface-2 disabled:opacity-30 sm:h-10 sm:w-10 sm:text-lg"
    >
      {children}
    </button>
  );
}
