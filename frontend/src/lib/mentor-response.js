const encoder = new TextEncoder();
const decoder = new TextDecoder();
const CRLF = encoder.encode("\r\n");
const HEADER_TERMINATOR = encoder.encode("\r\n\r\n");

function findSequence(buffer, sequence, fromIndex = 0) {
  outer: for (let index = fromIndex; index <= buffer.length - sequence.length; index += 1) {
    for (let offset = 0; offset < sequence.length; offset += 1) {
      if (buffer[index + offset] !== sequence[offset]) {
        continue outer;
      }
    }

    return index;
  }

  return -1;
}

function parseHeaders(headerBlock) {
  return headerBlock
    .split("\r\n")
    .filter(Boolean)
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      accumulator[key] = value;
      return accumulator;
    }, {});
}

async function parseJsonError(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload?.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function readMentorResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(
      await parseJsonError(response, "The mentor pipeline request failed."),
    );
  }

  if (!contentType.toLowerCase().includes("multipart/mixed")) {
    throw new Error("Unexpected mentor response format. Expected multipart audio payload.");
  }

  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);

  if (!boundaryMatch) {
    throw new Error("Mentor response boundary is missing.");
  }

  const boundary = boundaryMatch[1];
  const boundaryBytes = encoder.encode(`--${boundary}`);
  const delimiterBytes = encoder.encode(`\r\n--${boundary}`);
  const responseBytes = new Uint8Array(await response.arrayBuffer());
  const parts = [];
  let cursor = findSequence(responseBytes, boundaryBytes, 0);

  while (cursor !== -1) {
    let partStart = cursor + boundaryBytes.length;

    if (
      responseBytes[partStart] === 45 &&
      responseBytes[partStart + 1] === 45
    ) {
      break;
    }

    if (
      responseBytes[partStart] === CRLF[0] &&
      responseBytes[partStart + 1] === CRLF[1]
    ) {
      partStart += 2;
    }

    const headerEnd = findSequence(responseBytes, HEADER_TERMINATOR, partStart);

    if (headerEnd === -1) {
      break;
    }

    const headers = parseHeaders(
      decoder.decode(responseBytes.slice(partStart, headerEnd)),
    );
    const bodyStart = headerEnd + HEADER_TERMINATOR.length;
    let nextBoundaryIndex = findSequence(responseBytes, delimiterBytes, bodyStart);

    if (nextBoundaryIndex === -1) {
      nextBoundaryIndex = responseBytes.length;
    }

    parts.push({
      headers,
      body: responseBytes.slice(bodyStart, nextBoundaryIndex),
    });

    cursor = findSequence(responseBytes, boundaryBytes, nextBoundaryIndex);
  }

  const jsonPart = parts.find((part) =>
    (part.headers["content-type"] ?? "").toLowerCase().includes("application/json"),
  );
  const audioPart = parts.find((part) =>
    (part.headers["content-type"] ?? "").toLowerCase().startsWith("audio/"),
  );

  if (!jsonPart) {
    throw new Error("Mentor response JSON metadata is missing.");
  }

  if (!audioPart) {
    throw new Error("Mentor response audio payload is missing.");
  }

  return {
    metadata: JSON.parse(decoder.decode(jsonPart.body)),
    audioBlob: new Blob([audioPart.body], {
      type: audioPart.headers["content-type"] ?? "audio/mpeg",
    }),
  };
}
