import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-7xl font-light text-slate-300">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-800">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <Link to="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  );
}
