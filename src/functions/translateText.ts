interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
  };
}

function isMyMemoryResponse(value: unknown): value is MyMemoryResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "responseStatus" in value &&
    typeof value.responseStatus === "number" &&
    "responseData" in value &&
    typeof value.responseData === "object" &&
    value.responseData !== null &&
    "translatedText" in value.responseData &&
    typeof value.responseData.translatedText === "string"
  );
}

export async function translateText(text: string): Promise<string> {
  const params = new URLSearchParams({ text });
  const response = await fetch(`/api/translate?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!isMyMemoryResponse(payload) || payload.responseStatus !== 200) {
    throw new Error("The translation service returned an invalid response.");
  }

  const translation = payload.responseData.translatedText.trim();
  if (!translation) {
    throw new Error("The translation service returned an empty translation.");
  }

  return translation;
}
