import { getOpenAimSession, listAimSessions, openLocalDatabase } from "@openrange/db";

function database() {
  return openLocalDatabase(process.env.DATABASE_URL ?? "file:./data/openrange.db");
}

export function readSessionSnapshot(limit = 10) {
  const connection = database();
  try {
    return { current: getOpenAimSession(connection), history: listAimSessions(connection, limit) };
  } finally {
    connection.close();
  }
}
