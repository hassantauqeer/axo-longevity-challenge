import { useState } from "react";
import { uploadReport } from "../lib/api";
import type { APIResponse } from "../types";

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; data: APIResponse }
  | { status: "error"; message: string };

export function useUploadReport() {
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const upload = async (file: File) => {
    setState({ status: "uploading" });
    try {
      const data = await uploadReport(file);
      setState({ status: "success", data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload report";
      setState({ status: "error", message });
    }
  };

  const reset = () => setState({ status: "idle" });

  return { state, upload, reset };
}
