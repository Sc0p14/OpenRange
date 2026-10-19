"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LineupInput = {
  map: string;
  side: "T" | "CT" | "both";
  kind: "smoke" | "flash" | "molotov" | "he" | "decoy";
  title: string;
  stance: string;
  notes: string;
  tags: string;
};

const empty: LineupInput = {
  map: "",
  side: "T",
  kind: "smoke",
  title: "",
  stance: "",
  notes: "",
  tags: ""
};

export function LineupForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<LineupInput>(empty);
  const [status, setStatus] = useState(id ? "Загрузка…" : "");
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/lineups/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = (await response.json()) as {
          map: string;
          side: LineupInput["side"];
          kind: LineupInput["kind"];
          title: string;
          stance: string;
          notes: string;
          tags: string[];
        };
        setForm({ ...data, tags: data.tags.join(", ") });
        setLoaded(true);
        setStatus("");
      })
      .catch(() => setStatus("Раскид не найден в локальной базе."));
  }, [id]);

  async function submit(formData: FormData) {
    if (!loaded) return;
    const response = await fetch(id ? `/api/lineups/${id}` : "/api/lineups", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        map: formData.get("map"),
        side: formData.get("side"),
        kind: formData.get("kind"),
        title: formData.get("title"),
        stance: formData.get("stance"),
        notes: formData.get("notes"),
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
    });
    if (!response.ok) {
      setStatus("Не сохранено: проверьте, что карта вида de_dust2 и заголовок не пустой.");
      return;
    }
    setStatus(id ? "Сохранено." : "Раскид добавлен.");
    router.push("/lineups");
  }

  return (
    <form className="panel form" action={submit}>
      <label>
        Карта
        <input
          name="map"
          defaultValue={form.map}
          placeholder="de_dust2"
          pattern="[a-z0-9_-]{2,64}"
          required
        />
      </label>
      <label>
        Сторона
        <select name="side" defaultValue={form.side}>
          <option value="T">T</option>
          <option value="CT">CT</option>
          <option value="both">Обе</option>
        </select>
      </label>
      <label>
        Тип утилиты
        <select name="kind" defaultValue={form.kind}>
          <option value="smoke">Смок</option>
          <option value="flash">Флешка</option>
          <option value="molotov">Молотов</option>
          <option value="he">Осколочная</option>
          <option value="decoy">Ложная</option>
        </select>
      </label>
      <label>
        Название
        <input name="title" defaultValue={form.title} maxLength={120} required />
      </label>
      <label>
        Позиция и прицел
        <textarea name="stance" defaultValue={form.stance} rows={3} maxLength={2000} />
      </label>
      <label>
        Свободные заметки
        <textarea name="notes" defaultValue={form.notes} rows={4} maxLength={4000} />
      </label>
      <label>
        Теги <span className="muted">(через запятую)</span>
        <input name="tags" defaultValue={form.tags} placeholder="стандарт, полуфлеш" />
      </label>
      <button type="submit">{id ? "Сохранить" : "Добавить"}</button>
      <p className="muted" aria-live="polite">
        {status}
      </p>
      <p className="muted">
        Позиции хранятся текстом. Координаты и траектории появятся после исследования инструментов
        разметки — см. docs/research.
      </p>
    </form>
  );
}
