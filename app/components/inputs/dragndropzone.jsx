import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export default function DragNDropZone({ onDrop, avatarPreview: imgPreview, supportText, supportedTypes }) {
    const { getRootProps, getInputProps } = useDropzone({ onDrop });
    
    return (
      <div {...getRootProps()} className="cursor-pointer w-full flex flex-col items-center gap-2">
      <input {...getInputProps()} />
      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-[--md-sys-color-outline] hover:border-[--md-sys-color-primary] transition-colors">
          {imgPreview ? (
              <Image 
                  src={imgPreview} 
                  alt="Avatar preview" 
                  width={128} 
                  height={128}
                  className="object-cover w-full h-full"
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-[--md-sys-color-surface-variant]">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
              </div>
          )}
      </div>
      <span className="text-sm text-[--md-sys-color-on-surface-variant]">
          {supportText}
      </span>
  </div>
    );
}