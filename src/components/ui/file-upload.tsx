// src/components/ui/file-upload.tsx

"use client";

import { useCallback, useState } from "react";
import { UploadSimple, X, FileImage, FileVideo, File } from "@phosphor-icons/react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // en MB
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  selectedFile?: File | null;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = "image/*,video/*",
  maxSize = 100, // 100MB por defecto
  onFileSelect,
  onRemove,
  selectedFile,
  label = "Subir archivo",
  hint = "Arrastra un archivo o haz clic para seleccionar",
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `El archivo es muy grande. Máximo: ${maxSize}MB`;
    }

    // Validar tipo
    const acceptedTypes = accept.split(",").map(t => t.trim());
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith("/*")) {
        const category = type.split("/")[0];
        return file.type.startsWith(category);
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return "Tipo de archivo no permitido";
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [accept, maxSize, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = () => {
    setError(null);
    onRemove?.();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <FileImage size={48} weight="duotone" className="text-purple-600" />;
    }
    if (type.startsWith("video/")) {
      return <FileVideo size={48} weight="duotone" className="text-purple-600" />;
    }
    return <File size={48} weight="duotone" className="text-purple-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (selectedFile) {
    return (
      <div className="relative rounded-lg border-2 border-gray-200 bg-white p-4">
        <div className="flex items-center gap-4">
          {getFileIcon(selectedFile.type)}
          
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-gray-900">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              <X size={20} weight="bold" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-all
          ${isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-gray-50"}
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-purple-400 hover:bg-purple-50/50"}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-purple-100 p-3">
            <UploadSimple size={32} weight="duotone" className="text-purple-600" />
          </div>

          <div>
            <p className="font-medium text-gray-900">
              {hint}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Máximo {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}