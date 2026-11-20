"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track, trackAttrs } from "@/lib/analytics";
import { LEVELS } from "@/lib/meta";
import type { CardData } from "@/lib/types";
import { LazyDemo } from "./Demo";

type Filter = "all" | "basic" | "mid" | "adv";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...LEVELS.map((l) => ({ id: l.id as Filter, label: l.label })),
];
const isFilter = (v: string | null): v is Filter => FILTERS.some((f) => f.id === v);

/** Previews in the server HTML, so the first screen shows them before JavaScript loads */
const EAGER = 6;

function Card({ a, eager }: { a: CardData; eager: boolean }) {
  const level = LEVELS.find((l) => l.id === a.level)!;
  return (
    <Link href={`/anim/${a.id}`} className="card" aria-label={`${a.name}, ${level.label}`}>
      <LazyDemo html={a.demo} label={a.name} eager={eager} />
      <div className="row">
        <span className="card-name">{a.name}</span>
        <span className={`lv ${a.level}`}>{level.label}</span>
      </div>
      <p className="card-desc">{a.description}</p>
      <div className="row card-foot">
        <span className="cmd">/anim {a.id}</span>
        {a.source ? (
          <span className="src">{a.source}</span>
        ) : (
          <span className="mono card-tag" title={a.tag}>
            {a.tag}
          </span>
        )}
      </div>
    </Link>
  );
}

export function Catalog({ cards }: { cards: CardData[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  // Read ?f= and ?q= once on load so filters can be linked (e.g. /?f=adv#animations)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("f");
    if (isFilter(f)) setFilter(f);
    const query = p.get("q");
    if (query) setQ(query);
  }, []);

  const choose = (f: Filter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("f");
    else url.searchParams.set("f", f);
    window.history.replaceState(null, "", url);
  };

  const count = (f: Filter) => (f === "all" ? cards.length : cards.filter((a) => a.level === f).length);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter((a) => (filter === "all" || a.level === filter) && (!needle || a.hay.includes(needle)));
  }, [cards, filter, q]);

  // Report what people search for (debounced, so only settled queries are sent).
  const resultCount = hits.length;
  useEffect(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return;
    const timer = setTimeout(() => track("search", { query, results: resultCount }), 1500);
    return () => clearTimeout(timer);
  }, [q, resultCount]);

  // Index of each card in the list, so the first few on screen render their preview eagerly
  const order = new Map(hits.map((a, i) => [a.id, i]));

  return (
    <>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter animations">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip"
              aria-pressed={filter === f.id}
              onClick={() => choose(f.id)}
              {...trackAttrs("filter", { level: f.id })}
            >
              {f.label} · {count(f.id)}
            </button>
          ))}
        </div>
        <label className="search">
          <span aria-hidden="true">$ grep</span>
          <input
            id="search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="spotify, gesture, scroll"
            aria-label="Search animations"
          />
        </label>
      </div>

      {hits.length === 0 ? (
        <p className="empty">No match for “{q}”. Try spring, gesture or scroll.</p>
      ) : (
        LEVELS.map((l) => {
          const group = hits.filter((a) => a.level === l.id);
          if (!group.length) return null;
          return (
            <section key={l.id} aria-labelledby={`g-${l.id}`}>
              <h3 className="group-h" id={`g-${l.id}`}>
                {l.label}
                <small>
                  {group.length} {group.length === 1 ? "animation" : "animations"}
                </small>
              </h3>
              <div className="grid">
                {group.map((a) => (
                  <Card key={a.id} a={a} eager={order.get(a.id)! < EAGER} />
                ))}
              </div>
            </section>
          );
        })
      )}

    </>
  );
}
