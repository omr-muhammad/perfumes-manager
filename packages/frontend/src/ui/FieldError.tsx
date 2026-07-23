export function FieldError({
  message,
  className,
}: {
  message?: string;
  className: string;
}) {
  if (!message) return null;
  return (
    <span className={className} role="alert">
      {message}
    </span>
  );
}
