"use client";

import { FormEvent, useState } from "react";

type GenerateResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });
      const data: GenerateResponse = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "请求失败"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="card">
        <h1>即梦 4.0 生成器</h1>
        <p>输入 prompt，调用 /api/generate。</p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="请输入 prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "生成中..." : "生成"}
          </button>
        </form>

        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </main>
  );
}
