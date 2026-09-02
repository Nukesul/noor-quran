import { QuranDataError } from '../types';

/**
 * JSON fetch with a timeout and caller-supplied cancellation.
 *
 * Shared by the remote sources so they cannot drift apart on the parts that are
 * easy to get subtly wrong — already-aborted signals, timeout vs cancellation,
 * and which HTTP statuses are worth retrying.
 *
 * Uses the built-in `fetch`; no HTTP client dependency is warranted.
 */
export async function fetchJson(
  url: string,
  sourceId: string,
  timeoutMs: number,
  externalSignal: AbortSignal | undefined,
): Promise<unknown> {
  // A signal that is already aborted will never emit an 'abort' event, so
  // listening alone would miss it and the request would run to completion.
  if (externalSignal?.aborted) {
    throw new DOMException('Aborted before the request started', 'AbortError');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const forwardAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      const reason =
        response.status === 404 ? 'not-found' : response.status === 429 ? 'rate-limited' : 'network';

      throw new QuranDataError(reason, sourceId, `Request failed with status ${response.status}`);
    }

    return (await response.json()) as unknown;
  } catch (cause) {
    if (cause instanceof QuranDataError) throw cause;

    // An abort is either the caller cancelling or our own timeout firing.
    // Only the latter is an error worth surfacing; the caller already knows
    // about its own cancellation.
    if (cause instanceof Error && cause.name === 'AbortError') {
      if (externalSignal?.aborted) throw cause;
      throw new QuranDataError('timeout', sourceId, `Request timed out after ${timeoutMs}ms`, {
        cause,
      });
    }

    throw new QuranDataError('network', sourceId, 'Network request failed', { cause });
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', forwardAbort);
  }
}
