"use client";

import { useState, useCallback, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUploader({ onVideoSelect, disabled }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith("video/")) {
        setSelectedFile(file);
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"]
    },
    disabled,
    multiple: false
  });

  const handleClearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-500"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-lg font-medium">
              拖放视频文件到这里，或点击选择文件
            </p>
            <p className="text-sm text-gray-500 mt-2">
              支持 MP4、MOV、AVI、MKV 格式
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <File className="w-6 h-6 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSelection}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex space-x-4">
        <Input
          type="file"
          accept="video/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              onVideoSelect(file);
            }
          }}
          className="flex-1"
          disabled={disabled}
        />
        <Button
          onClick={() => selectedFile && onVideoSelect(selectedFile)}
          disabled={!selectedFile || disabled}
          className="min-w-[100px]"
        >
          上传视频
        </Button>
      </div>
    </div>
  );
} 