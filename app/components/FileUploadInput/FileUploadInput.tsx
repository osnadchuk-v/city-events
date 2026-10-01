'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';

interface FileUploadInputProps {
  id: string;
  onChange?: (v: { url: string; path: string }) => void;
  name: string;
  accept?: string;
  disabled?: boolean;
}

const ImageField = ({ id, onChange, name, accept, disabled }: FileUploadInputProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <input
      id={id}
      type="file"
      accept={accept}
      name={name}
      disabled={disabled || loading}
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
          const blob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          onChange?.({ url: blob.url, path: blob.pathname });
        } catch (error) {
          console.error('Failed to upload image:', error);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
};

export default ImageField;
