"use client";

import { useEffect, useState } from "react";

type Profile = {
  nickname: string;
  settings: {
    locale: "ru" | "en";
    theme: "dark" | "light";
    cs2Path: string | null;
    gsiPort: number;
  };
};

export function SettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("Загрузка локальных настроек…");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<Profile>;
      })
      .then((data) => {
        setProfile(data);
        setStatus("");
      })
      .catch(() => setStatus("Не удалось открыть локальную базу данных."));
  }, []);
  if (!profile) return <p className="muted">{status}</p>;

  async function submit(formData: FormData) {
    setStatus("Сохранение…");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nickname: formData.get("nickname"),
        locale: formData.get("locale"),
        theme: formData.get("theme"),
        cs2Path: formData.get("cs2Path") || null,
        gsiPort: Number(formData.get("gsiPort"))
      })
    });
    if (!response.ok) {
      setStatus("Настройки не сохранены.");
      return;
    }
    setProfile((await response.json()) as Profile);
    setStatus("Сохранено локально.");
  }

  async function downloadGsiConfig() {
    if (!profile) return;
    setStatus("Формирование GSI-конфига…");
    const response = await fetch("/api/gsi/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ host: "127.0.0.1", port: profile.settings.gsiPort })
    });
    if (!response.ok) {
      setStatus("Не удалось сформировать GSI-конфиг.");
      return;
    }
    const token = response.headers.get("x-openrange-gsi-token");
    const content = await response.text();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    link.download = "gamestate_integration_openrange.cfg";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus(
      token
        ? "GSI-конфиг скачан. Скопируйте его в cfg игры и укажите тот же токен в GSI_AUTH_TOKEN перед запуском приёмника."
        : "GSI-конфиг скачан."
    );
  }

  return (
    <form className="panel form" action={submit}>
      <label>
        Имя профиля
        <input name="nickname" defaultValue={profile.nickname} maxLength={40} required />
      </label>
      <label>
        Язык
        <select name="locale" defaultValue={profile.settings.locale}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </label>
      <label>
        Тема
        <select name="theme" defaultValue={profile.settings.theme}>
          <option value="dark">Тёмная</option>
          <option value="light">Светлая</option>
        </select>
      </label>
      <label>
        Путь к CS2 <span className="muted">(необязательно)</span>
        <input name="cs2Path" defaultValue={profile.settings.cs2Path ?? ""} />
      </label>
      <label>
        Порт GSI
        <input
          name="gsiPort"
          type="number"
          min="1"
          max="65535"
          defaultValue={profile.settings.gsiPort}
        />
      </label>
      <button type="submit">Сохранить</button>
      <button type="button" onClick={downloadGsiConfig}>
        Скачать GSI cfg
      </button>
      <p className="muted" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
