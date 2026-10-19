"use client";

import { useCallback, useEffect, useState } from "react";

type Session = {
  id: string;
  status: "open" | "closed";
  mapName: string | null;
  mode: string | null;
  startedAt: string;
  endedAt: string | null;
  kills: number;
  hsKills: number;
};

function formatHsShare(session: Session): string {
  if (session.kills === 0) return "—";
  return `${Math.round((session.hsKills / session.kills) * 100)}%`;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function AimSessionWidget() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { history: Session[] };
      setSessions(data.history);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 2000);
    return () => clearInterval(timer);
  }, [refresh]);

  if (error) return <p className="muted">Не удалось подключиться к локальной базе данных.</p>;
  if (sessions === null) return <p className="muted">Загрузка сессий…</p>;

  const open = sessions.find((session) => session.status === "open");
  const closed = sessions.filter((session) => session.status === "closed");

  return (
    <div className="panel">
      <h2>Текущая сессия</h2>
      {open ? (
        <table>
          <tbody>
            <tr>
              <th>Карта</th>
              <td>{open.mapName ?? "—"}</td>
              <th>Режим</th>
              <td>{open.mode ?? "—"}</td>
            </tr>
            <tr>
              <th>Убийства</th>
              <td>{open.kills}</td>
              <th>Хедшот-убийства</th>
              <td>{open.hsKills}</td>
            </tr>
            <tr>
              <th>HS%</th>
              <td>{formatHsShare(open)}</td>
              <th>Начало</th>
              <td>{formatClock(open.startedAt)}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="muted">
          Нет открытой сессии. Зайдите в локальный матч с ботами — сессия откроется автоматически.
        </p>
      )}

      <h2>История</h2>
      {closed.length === 0 ? (
        <p className="muted">Пока нет завершённых сессий.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Начало</th>
              <th>Карта</th>
              <th>Режим</th>
              <th>Убийства</th>
              <th>HS%</th>
            </tr>
          </thead>
          <tbody>
            {closed.map((session) => (
              <tr key={session.id}>
                <td>{formatClock(session.startedAt)}</td>
                <td>{session.mapName ?? "—"}</td>
                <td>{session.mode ?? "—"}</td>
                <td>{session.kills}</td>
                <td>{formatHsShare(session)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted">
        Метрики считаются из клиентского GSI: убийства и хедшоты за раунд. Точный подсчёт выстрелов
        и попаданий появится позже на серверной стороне.
      </p>
    </div>
  );
}
