export function Card({ className = '', children }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`border-b px-6 py-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
