import { useRef } from 'react';

export function FileUpload({ onFileParsed, disabled }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        onFileParsed(text, file.name);
      }
      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  }

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        disabled={disabled}
        aria-label="Upload CSV"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Upload CSV
      </button>
    </div>
  );
}
