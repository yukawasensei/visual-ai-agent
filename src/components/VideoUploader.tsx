"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUploader({ onVideoSelect, disabled }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith("video/")) {
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

  return (
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
  );
} 