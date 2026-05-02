import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Maximize,
  Download
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface ImageUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function ImageUpload({ 
  onUpload,
  maxFiles = 10,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = true,
  showPreview = true,
  className = ""
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }
    return null;
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const uploadFileToServer = async (file: File, fileType: string = 'image'): Promise<string> => {
    // Upload file to server
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', fileType);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.image?.url || data.url;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const processFiles = async (fileList: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Errors",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    const newFiles: UploadedFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = generateId();
        const preview = showPreview ? await createFilePreview(file) : undefined;
        
        return {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: '', // Will be set after upload
          preview,
          status: 'uploading' as const,
          progress: 0
        };
      })
    );

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files with progress simulation
    for (const fileData of newFiles) {
      try {
        const originalFile = validFiles.find(f => f.name === fileData.name)!;
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
              : f
          ));
        }, 300);

        const url = await uploadFileToServer(originalFile, 'image');
        
        clearInterval(progressInterval);
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, url, status: 'completed', progress: 100 }
            : f
        ));

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { 
                ...f, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ));
      }
    }

    setIsUploading(false);
    onUpload(files.filter(f => f.status === 'completed'));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryUpload = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      ));
      // Retry upload logic would go here
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50 ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className={`rounded-full p-4 mb-4 ${isDragOver ? 'bg-primary/10' : 'bg-muted'}`}>
            <Upload className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Images'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            Drag and drop your images here, or{' '}
            <span className="text-primary font-medium">browse files</span>
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            <Badge variant="outline">Max {maxFiles} files</Badge>
            <Badge variant="outline">Up to {maxSize}MB each</Badge>
            <Badge variant="outline">JPG, PNG, WebP, GIF</Badge>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
              {isUploading && (
                <Badge variant="secondary" className="animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Uploading...
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <div className="relative">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                        {file.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2">
                        {file.status === 'completed' && file.url && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              className="h-6 px-2"
                            >
                              <Maximize className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = file.url;
                                a.download = file.name;
                                a.click();
                              }}
                              className="h-6 px-2"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        {file.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(file.id)}
                            className="h-6 px-2 text-orange-600"
                          >
                            Retry
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-6 px-2 text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {file.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <Progress value={file.progress} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(file.progress)}%
                            </span>
                          </div>
                        )}
                        
                        {file.status === 'completed' && (
                          <Badge variant="default" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Uploaded
                          </Badge>
                        )}
                        
                        {file.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Simplified version for single image uploads
export function SingleImageUpload({ 
  value, 
  onChange,
  onFileChange,
  placeholder = "Upload an image"
}: {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
  placeholder?: string;
}) {
  const handleUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      onChange(files[0].url);
      if (onFileChange) {
        // We need to get the original file, but UploadedFile doesn't have it
        // For now, we'll set it to null and handle this differently
        onFileChange(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onChange('')}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <ImageUpload
        onUpload={handleUpload}
        maxFiles={1}
        multiple={false}
        showPreview={true}
      />
    </div>
  );
}