import { apiFetch, getApiImageUrl } from "./api";

export interface SizeChartEntry {
  cells: string[];
}

export interface HowToMeasure {
  guideImage: string;
  steps: { title: string; desc: string }[];
}

export interface SizeChartData {
  _id: string;
  name: string;
  headers: string[];
  table: SizeChartEntry[];
  howToMeasureImage: string | { url: string; public_id?: string };
  unit: string;
}

export const fetchSizeChart = async (): Promise<{
  success: boolean;
  data: SizeChartData;
}> => {
  return apiFetch("/size-chart");
};

export const getHowToMeasureImageUrl = (
  path: string | { url: string; public_id?: string } | undefined,
  fallback: string = "/assets/Apparel-Illustration.svg",
): string => {
  return getApiImageUrl(path, fallback);
};
