"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Lineup = {
  id: string;
  map: string;
  side: "T" | "CT" | "both";
  kind: "smoke" | "flash" | "molotov" | "he" | "decoy";
  title: string;
  stance: string;
  notes: string;
  tags: string[];
};

const kindLabels: Record<Lineup["kind"], string> = {
  smoke: "Смок",
  flash: "Флешка",
  molotov: "Молотов",
  he: "Осколочная",
  decoy: "Ложная"
};

export function LineupsBrowser() {
  const [items, setItems] = useState<Lineup[] | null>(null);
  const [filters, setFilters] = useState({ map: "", side: "", kind: "", search: "" });

  const refresh = useCallback(async () => {
    const query = new URLSearchParams();
    if (filters.map) query.set("map", filters.map);
    if (filters.side) query.set("side", filters.side);
    if (filters.kind) query.set("kind", filters.kind);
    if (filters.search) query.set("search", filters.search);
    const response = await fetch(`/api/lineups?${query.toString()}`);
    if (!response.ok) {
      setItems([]);
      return;
    }
    const data = (await response.json()) as { items: Lineup[] };
    setItems(data.items);
  }, [filters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function remove(id: string) {
    await fetch(`/api/lineups/${id}`, { method: "DELETE" });
    void refresh();
  }

  return (
    <div className="panel">
      <h2>Библиотека раскидов</h2>
      <div className="filters">
        <input
          placeholder="Карта (например, de_dust2)"
          value={filters.map}
          onChange={(event) => setFilters((state) => ({ ...state, map: event.target.value }))}
        />
        <label>
          Сторона
          <select
            value={filters.side}
            onChange={(event) => setFilters((state) => ({ ...state, side: event.target.value }))}
          >
            <option value="">Все</option>
            <option value="T">T</option>
            <option value="CT">CT</option>
          </select>
        </label>
        <label>
          Тип
          <select
            value={filters.kind}
            onChange={(event) => setFilters((state) => ({ ...state, kind: event.target.value }))}
          >
            <option value="">Все</option>
            {Object.entries(kindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder="Поиск по описанию"
          value={filters.search}
          onChange={(event) => setFilters((state) => ({ ...state, search: event.target.value }))}
        />
        <Link href="/lineups/new">Добавить раскид</Link>
      </div>

      {items === null ? (
        <p className="muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="muted">
          Пока пусто. Добавьте свой первый раскид — описание позиции свободным текстом, без
          выдуманных координат.
        </p>
      ) : (
        <ul className="lineups">
          {items.map((lineup) => (
            <li key={lineup.id}>
              <article>
                <header>
                  <strong>{lineup.title}</strong>
                  <span className="muted">
                    {lineup.map} · {lineup.side === "both" ? "обе стороны" : lineup.side} ·{" "}
                    {kindLabels[lineup.kind]}
                  </span>
                </header>
                {lineup.stance ? (
                  <p>
                    <em>Позиция:</em> {lineup.stance}
                  </p>
                ) : null}
                {lineup.notes ? <p>{lineup.notes}</p> : null}
                {lineup.tags.length > 0 ? (
                  <p className="muted">Теги: {lineup.tags.join(", ")}</p>
                ) : null}
                <div>
                  <Link href={`/lineups/${lineup.id}`}>Редактировать</Link>
                  <button type="button" onClick={() => void remove(lineup.id)}>
                    Удалить
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
