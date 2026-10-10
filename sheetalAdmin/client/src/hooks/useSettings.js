"use client";
import { useState, useEffect } from "react";
import { getSettings } from "@/services/settingsService";

let cachedSettings = null;
let promise = null;

export default function useSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setLoading(false);
      return;
    }

    if (!promise) {
      promise = getSettings().then((res) => {
        if (res.success) {
          cachedSettings = res.data;
          return res.data;
        }
        return null;
      });
    }

    promise.then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const refreshSettings = async () => {
    promise = getSettings().then((res) => {
      if (res.success) {
        cachedSettings = res.data;
        setSettings(res.data);
        return res.data;
      }
      return null;
    });
    return promise;
  };

  return { settings, loading, refreshSettings };
}
