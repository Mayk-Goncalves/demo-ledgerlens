import { Directory, File, Paths } from "expo-file-system";

const receiptsDir = new Directory(Paths.document, "receipts");

/** Ensure the receipts directory exists. */
function ensureDir(): void {
  if (!receiptsDir.exists) {
    receiptsDir.create();
  }
}

/**
 * Copy an image from a temporary cache URI to persistent app storage.
 * Returns the permanent file URI.
 */
export function persistReceipt(cacheUri: string): string {
  ensureDir();
  const ext = cacheUri.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const source = new File(cacheUri);
  const dest = new File(receiptsDir, filename);
  source.copy(dest);
  return dest.uri;
}
