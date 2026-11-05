import { Link } from 'react-router-dom';
import { Unplug } from 'lucide-react';
import Notice from '../components/Notice';

export default function NotFound() {
  return (
    <div className="pt-6">
      <Notice
        icon={Unplug}
        title="404: Route not found"
        body="This address does not lead anywhere."
        action={
          <Link to="/" className="btn btn-primary mt-6">
            Return Home
          </Link>
        }
      />
    </div>
  );
}
