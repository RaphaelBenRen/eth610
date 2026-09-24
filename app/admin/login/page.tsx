"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else setError(true);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-bold">🔒 Dashboard admin</h1>
        <p className="mt-1 text-sm text-muted">Accès réservé à l&apos;équipe du projet.</p>
        <label className="mt-6 block text-sm font-medium" htmlFor="pw">
          Mot de passe
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-brand focus:ring-4 focus:ring-brand/20"
        />
        {error && <p className="mt-2 text-sm text-bad">Mot de passe incorrect.</p>}
        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={!password || loading}>
          {loading ? "…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
