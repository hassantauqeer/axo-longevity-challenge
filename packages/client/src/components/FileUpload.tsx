import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxSize: 10 * 1024 * 1024,
      multiple: false,
      disabled: isUploading,
    });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {acceptedFiles.length > 0 ? (
            <>
              <FileText className="w-16 h-16 text-primary-600" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {acceptedFiles[0].name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive
                    ? "Drop your PDF here"
                    : "Upload Lab Report PDF"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF files only, max 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {acceptedFiles.length > 0 && !isUploading && (
        <button
          onClick={() => onFileSelect(acceptedFiles[0])}
          className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Analyze Report
        </button>
      )}
    </div>
  );
}
