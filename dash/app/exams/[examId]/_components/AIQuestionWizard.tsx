"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react"; // Икон ашиглавал илүү гоё харагдана

type AIQuestionWizardProps = {
  onBack: () => void;
};

export function AIQuestionWizard({ onBack }: AIQuestionWizardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    // 'files' гэдэг нэр нь таны backend-ийн upload.array("files", 5) -той таарч байх ёстой
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await fetch(
        "https://tesseract-provider-production.up.railway.app/ocr",
        {
          method: "POST",
          body: formData,
          // CORS болон бусад тохиргоог Railway автоматаар зохицуулна
        },
      );

      if (!response.ok) throw new Error("Сервертэй холбогдоход алдаа гарлаа.");

      const data = await response.json();
      setResult(data.aiCorrected); // AI-аар зассан текстийг авч байна
    } catch (err: any) {
      setError(err.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={onBack}
      >
        ← Буцах
      </Button>

      <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center">
        {!result ? (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Асуултын зураг хуулах
            </p>
            <p className="text-xs text-muted-foreground">
              Зургийг OCR-оор уншуулж, AI-аар засуулна.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="ocr-upload"
              disabled={loading}
            />
            <label htmlFor="ocr-upload">
              <Button asChild disabled={loading}>
                <span>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}{" "}
                  Зураг сонгох
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="text-left space-y-3">
            <h4 className="font-semibold text-sm">AI Зассан текст:</h4>
            <div className="p-3 bg-white border rounded-md text-sm whitespace-pre-wrap">
              {result}
            </div>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              Дахин уншуулах
            </Button>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
