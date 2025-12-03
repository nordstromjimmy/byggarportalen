"use client";

import { useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  projectId: string;
  tidsplanImageUrl: string | null;
  tidsplanImagePath: string | null;
  isOwner: boolean;
  onImageChange: (data: { url: string | null; path: string | null }) => void;
};

export default function ProjectTidsplanSection({
  projectId,
  tidsplanImageUrl,
  tidsplanImagePath,
  isOwner,
  onImageChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  const [confirmDeleteImage, setConfirmDeleteImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Hard cap on original file size (so someone doesn't upload 100MB…)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("Filen är för stor (max 25 MB).");
      return;
    }

    setUploading(true);

    // Remember old path (if any) for cleanup
    const oldPath = tidsplanImagePath || extractPathFromUrl(tidsplanImageUrl);

    try {
      // 1) Komprimera bilden i webbläsaren
      const compressedBlob = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.7,
        mimeType: "image/jpeg",
      });

      // 2) Bygg en filväg och ett "filnamn" för upload
      const ext = "jpg";
      const filePath = `${projectId}/tidsplan-${Date.now()}.${ext}`;

      // Supabase бібліotека accepterar Blob, men vi kan ge ett File-liknande obj
      const uploadFile = new File([compressedBlob], `tidsplan.${ext}`, {
        type: "image/jpeg",
      });

      // 3) Ladda upp till storage
      const { error: uploadError } = await supabase.storage
        .from("project-tidsplan")
        .upload(filePath, uploadFile, {
          upsert: true,
          contentType: uploadFile.type,
        });

      if (uploadError) {
        console.error(uploadError);
        setErrorMsg("Kunde inte ladda upp tidsplansbilden.");
        return;
      }

      // 4) Hämta public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-tidsplan").getPublicUrl(filePath);

      // 5) Uppdatera projektet i databasen
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          tidsplan_image_url: publicUrl,
          tidsplan_image_path: filePath,
        })
        .eq("id", projectId);

      if (updateError) {
        console.error(updateError);
        setErrorMsg("Kunde inte spara tidsplansbilden på projektet.");
        return;
      }

      // 6) Uppdatera state i parent
      onImageChange({ url: publicUrl, path: filePath });

      // 7) Ta bort gammal fil om den fanns
      if (oldPath && oldPath !== filePath) {
        const { error: removeError } = await supabase.storage
          .from("project-tidsplan")
          .remove([oldPath]);

        if (removeError) {
          console.warn("Kunde inte ta bort gammal tidsplansbild:", removeError);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid uppladdning/komprimering.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function extractPathFromUrl(url: string | null): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      // URL looks like: /storage/v1/object/public/project-tidsplan/<path>
      const marker = "/project-tidsplan/";
      const idx = u.pathname.indexOf(marker);
      if (idx === -1) return null;
      return u.pathname.slice(idx + marker.length);
    } catch {
      return null;
    }
  }

  async function compressImage(
    file: File,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number; // 0–1
      mimeType?: string;
    }
  ): Promise<Blob> {
    const {
      maxWidth = 1600,
      maxHeight = 1600,
      quality = 0.7,
      mimeType,
    } = options || {};

    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Kunde inte läsa bildfilen."));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Ogiltigt bildformat."));
      image.src = imageDataUrl;
    });

    const canvas = document.createElement("canvas");
    let { width, height } = img;

    // Behåll proportioner men begränsa max storlek
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kunde inte skapa canvas för komprimering.");

    ctx.drawImage(img, 0, 0, width, height);

    const targetType = mimeType || "image/jpeg";

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Kunde inte komprimera bilden."));
          } else {
            resolve(result);
          }
        },
        targetType,
        quality
      );
    });

    return blob;
  }

  async function handleRemoveImage() {
    if (!tidsplanImageUrl && !tidsplanImagePath) return;

    setErrorMsg(null);
    setDeletingImage(true);

    // Prefer stored path, fall back to parsing from URL
    const pathToRemove =
      tidsplanImagePath || extractPathFromUrl(tidsplanImageUrl);

    try {
      // 1) Remove from storage (if we know the path)
      if (pathToRemove) {
        const { error: removeError } = await supabase.storage
          .from("project-tidsplan")
          .remove([pathToRemove]);

        if (removeError) {
          console.warn("Kunde inte ta bort filen från storage:", removeError);
        }
      }

      // 2) Clear fields on project row
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          tidsplan_image_url: null,
          tidsplan_image_path: null,
        })
        .eq("id", projectId);

      if (updateError) {
        console.error(updateError);
        setErrorMsg("Kunde inte ta bort tidsplansbilden från projektet.");
        return;
      }

      // 3) Update parent state & close dialog
      onImageChange({ url: null, path: null });
      setConfirmDeleteImage(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid borttagning.");
    } finally {
      setDeletingImage(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-sm font-semibold text-slate-100">Tidsplan</h2>

        {/* Owner upload controls */}
        {isOwner && (
          <div className="mt-3 space-y-2 text-xs">
            <label className="block text-[11px] text-slate-300">
              Ladda upp / ersätt bild
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-[11px] text-slate-200 file:mr-2 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-slate-100 hover:file:bg-slate-700 cursor-pointer"
            />
            {uploading && (
              <p className="text-[11px] text-slate-400">
                Laddar upp tidsplansbild…
              </p>
            )}
            {tidsplanImageUrl && (
              <button
                type="button"
                onClick={() => setConfirmDeleteImage(true)}
                className="text-[11px] text-red-300 hover:text-red-200 cursor-pointer"
              >
                Ta bort nuvarande bild
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="mt-2 text-[11px] text-red-400">{errorMsg}</p>
        )}

        {/* Preview */}
        <div className="mt-3">
          {tidsplanImageUrl ? (
            <button
              type="button"
              onClick={() => setShowFull(true)}
              className="group relative block w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50"
            >
              <img
                src={tidsplanImageUrl}
                alt="Tidsplan"
                className="h-48 w-full object-cover transition group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-100">
                  Klicka för att visa större
                </span>
              </div>
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              Ingen tidsplansbild uppladdad ännu.
              {isOwner && " Ladda upp en bild för att visa tidsplanen här."}
            </p>
          )}
        </div>
      </div>

      {/* Fullscreen viewer */}
      {showFull && tidsplanImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            type="button"
            onClick={() => setShowFull(false)}
            className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            Stäng
          </button>
          <img
            src={tidsplanImageUrl}
            alt="Tidsplan"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
      <ConfirmDialog
        open={confirmDeleteImage}
        title="Ta bort tidsplan"
        description="Är du säker på att du vill ta bort den här tidsplansbilden från projektet?"
        confirmLabel="Ta bort bild"
        cancelLabel="Avbryt"
        variant="danger"
        loading={deletingImage}
        onClose={() => {
          if (!deletingImage) setConfirmDeleteImage(false);
        }}
        onConfirm={() => {
          void handleRemoveImage();
        }}
      />
    </>
  );
}
