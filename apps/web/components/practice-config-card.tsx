"use client";

import { useState } from "react";

export function PracticeConfigCard() {
  const [preset, setPreset] = useState("warmup");
  const [status, setStatus] = useState("");

  async function download() {
    setStatus("Формирование cfg…");
    const response = await fetch("/api/practice-config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ preset })
    });
    if (!response.ok) {
      setStatus("Не удалось сформировать cfg.");
      return;
    }
    const content = await response.text();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    link.download = "openrange_practice.cfg";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus(
      "Cfg скачан. Скопируйте его в <CS2>\\game\\csgo\\cfg\\ и введите exec openrange_practice в консоли локальной практики. Команды до проверки: TODO-RESEARCH."
    );
  }

  return (
    <div className="panel">
      <h2>Practice cfg</h2>
      <p className="muted">
        Конфиг только для локальной практики или своего сервера. Команды помечены TODO-RESEARCH:
        поведение проверяется на вашем CS2.
      </p>
      <label>
        Пресет
        <select value={preset} onChange={(event) => setPreset(event.target.value)}>
          <option value="warmup">Warmup (бесконечный респавн, закупка)</option>
          <option value="utility">Утилиты (траектории гранат, лимит)</option>
        </select>
      </label>
      <button type="button" onClick={() => void download()}>
        Скачать openrange_practice.cfg
      </button>
      <p className="muted" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
