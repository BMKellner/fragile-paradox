import { useEffect, useRef, useState } from "react";

type EditableTextProps = {
  value: string;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  onCommit: (value: string) => void;
};

export function EditableText({
  value,
  className,
  multiline = false,
  placeholder,
  onCommit,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as never}
          className={className}
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onCommit(draft);
          }}
        />
      );
    }

    return (
      <input
        ref={inputRef as never}
        className={className}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setIsEditing(false);
          onCommit(draft);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => setIsEditing(true)}
      aria-label="Edit text"
    >
      {value || placeholder || "Click to edit"}
    </button>
  );
}

