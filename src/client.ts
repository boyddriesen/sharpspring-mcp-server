export class SharpSpringError extends Error {
  code?: number;
  data?: unknown;

  constructor(message: string, code?: number, data?: unknown) {
    super(message);
    this.name = "SharpSpringError";
    this.code = code;
    this.data = data;
  }
}

interface SharpSpringResponse<T> {
  result: T | null;
  error: { code: number; message: string; data?: unknown } | null;
  id: string;
}

export class SharpSpringClient {
  private readonly accountID: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor() {
    const accountID = process.env.SHARPSPRING_ACCOUNT_ID;
    const secretKey = process.env.SHARPSPRING_SECRET_KEY;
    const apiVersion = process.env.SHARPSPRING_API_VERSION ?? "v1.2";

    if (!accountID || !secretKey) {
      throw new Error(
        "Missing SharpSpring credentials. Set SHARPSPRING_ACCOUNT_ID and SHARPSPRING_SECRET_KEY as environment variables."
      );
    }

    this.accountID = accountID;
    this.secretKey = secretKey;
    this.baseUrl = `https://api.sharpspring.com/pubapi/${apiVersion}/`;
  }

  /** Calls any documented SharpSpring API method by name. */
  async call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("accountID", this.accountID);
    url.searchParams.set("secretKey", this.secretKey);

    // Filter out undefined values so optional params aren't sent as nulls.
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params: cleanParams, id: requestId }),
    });

    if (!response.ok) {
      throw new SharpSpringError(
        `SharpSpring API request failed with HTTP ${response.status}`,
        response.status
      );
    }

    const body = (await response.json()) as SharpSpringResponse<T>;

    if (body.error) {
      throw new SharpSpringError(body.error.message, body.error.code, body.error.data);
    }

    return body.result as T;
  }
}
