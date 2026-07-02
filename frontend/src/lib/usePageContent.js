import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function usePageContent(key) {
  const [content, setContent] = useState({});
  useEffect(() => {
    api.get(`/pages/${key}`).then((r) => setContent(r.data.content || {})).catch(() => {});
  }, [key]);
  return content;
}
