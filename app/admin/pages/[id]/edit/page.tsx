"use client";

import React, { useState, useEffect } from "react";
import { PageForm } from "@/components/admin/PageForm";

export default function EditStaticPage({ params }: { params: { id: string } }) {
  const [pageData, setPageData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pages/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.page) {
          setPageData(data.page);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-neutral-400">
        Loading editorial page...
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="py-24 text-center text-xs font-mono text-red-500">
        Page not found.
      </div>
    );
  }

  return <PageForm initialData={pageData} />;
}
