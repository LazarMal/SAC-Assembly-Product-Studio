import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main id="main-content" className="container page-lead"><h1>That page isn't here.</h1><p>Let's find something worth exploring.</p><Link className="button button-dark" to="/collection">Back to collection</Link></main>;
}
