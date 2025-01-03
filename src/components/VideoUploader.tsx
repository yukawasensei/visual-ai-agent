"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface VideoUploaderProps {
  onUploadComplete?: (result: any) => void;
}

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      await handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      onUploadComplete?.(result);
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传出错');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">视频上传</h2>
        <p className="text-gray-600 mb-4">
          支持拖拽或点击上传视频文件。支持的格式：MP4、MOV、AVI、MKV，最大文件大小：100MB
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-6 h-6 text-blue-500" />
              <span className="text-lg">{selectedFile.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {uploading && (
              <div className="w-full max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="mt-2 text-sm text-gray-600">上传中...{uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <p className="text-lg">
                {isDragActive ? '释放文件以上传' : '拖拽视频文件到这里，或点击选择'}
              </p>
              <p className="text-sm text-gray-500">支持 MP4、MOV、AVI、MKV 格式</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <h3 className="font-semibold">使用说明：</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>选择或拖拽视频文件到上传区域</li>
          <li>等待视频上传完成</li>
          <li>系统会自动分析视频内容，识别产品、人物和动作</li>
          <li>分析完成后，可以在时间轴上查看和编辑视频片段</li>
          <li>选择需要的片段进行导出</li>
        </ol>
      </div>
    </div>
  );
} 