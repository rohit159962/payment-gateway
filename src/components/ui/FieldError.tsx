interface Props {
  message: string;
  id: string;
}

export function FieldError({ message, id }: Props) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
      <span>⚠</span> {message}
    </p>
  );
}