import { useState, useRef } from "react";
import { Upload, X, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export default function FileUpload({ 
  files, 
  onFilesChange, 
  maxFiles = 5, 
  accept = "image/*,video/*" 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    const totalFiles = [...files, ...validFiles];
    if (totalFiles.length <= maxFiles) {
      onFilesChange(totalFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const openFileExplorer = () => {
    inputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video size={20} className="text-purple-500" />;
    }
    return <Upload size={20} className="text-gray-500" />;
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileExplorer}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-900 mb-2">
          Upload photos or videos
        </p>
        <p className="text-xs text-gray-500">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Maximum {maxFiles} files, images and videos only
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">
            Selected Files ({files.length}/{maxFiles})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}