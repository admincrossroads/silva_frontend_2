import api from "./index";

export const exportApi = {
  afpPdf: (afpLineId: string) =>
    api.get(`/exports/afp/${afpLineId}/pdf`, { responseType: "blob" }).then((r) => r.data as Blob),

  boardPackPdf: (period: string, type = "monthly") =>
    api
      .post(`/exports/board-pack/pdf`, { period, type }, { responseType: "blob" })
      .then((r) => r.data as Blob),

  reportPdf: (reportId: string) =>
    api.get(`/exports/reports/${reportId}/pdf`, { responseType: "blob" }).then((r) => r.data as Blob),

  silvaGlDrop: (period: string) =>
    api.post<{ data: { exportId: string; fileName: string; filePath: string; rowCount: number } }>(
      "/exports/silva-gl-drop",
      { period },
    ).then((r) => r.data.data),
};

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
