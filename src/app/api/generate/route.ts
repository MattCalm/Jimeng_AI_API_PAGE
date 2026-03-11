import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.VOLCENGINE_BASE_URL ?? "https://ark.cn-beijing.volces.com/api/v3";
const MODEL = process.env.VOLCENGINE_MODEL;
const API_KEY = process.env.VOLCENGINE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY || !MODEL) {
      return NextResponse.json(
        {
          success: false,
          error: "服务端缺少 VOLCENGINE_API_KEY 或 VOLCENGINE_MODEL 环境变量"
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "prompt 不能为空"
        },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        prompt
      })
    });

    const raw = await upstream.text();
    const payload = raw ? JSON.parse(raw) : {};

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error: payload?.error?.message ?? "调用即梦接口失败",
          data: payload
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: payload
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    );
  }
}
