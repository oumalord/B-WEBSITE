import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';

export default function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for could not be found.');
  return (
    <section className="section">
      <div className="wrap max-w-xl text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-4xl text-plum sm:text-5xl">This page has come undone</h1>
        <p className="lead mx-auto">We couldn’t find the page you were looking for. Let’s get you back to something beautiful.</p>
        <Link to="/" className="btn-primary mt-8">Back to Homepage</Link>
      </div>
    </section>
  );
}
