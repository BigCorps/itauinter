import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  accept?: string;
}

export function FileUpload({ label, value, onChange, placeholder, accept }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Converter para base64 se não for texto
      if (accept?.includes('.crt') || accept?.includes('.key')) {
        const base64 = btoa(content);
        onChange(base64);
      } else {
        onChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Área de upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragOver 
            ? "border-blue-400 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            Arraste o arquivo aqui ou clique para selecionar
          </div>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-${label}`)?.click()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
        </div>
      </div>

      {/* Textarea para edição manual */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Ou cole o conteúdo manualmente:</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {value && (
        <div className="text-xs text-green-600 flex items-center space-x-1">
          <FileText className="h-3 w-3" />
          <span>Arquivo carregado ({value.length} caracteres)</span>
        </div>
      )}
    </div>
  );
}
