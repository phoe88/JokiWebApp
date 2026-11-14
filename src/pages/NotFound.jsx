import { Link } from 'react-router-dom';
import { Unplug } from 'lucide-react';
import Notice from '../components/Notice';
import SitePage from '../components/shell/SitePage';

export default function NotFound() {
  return (
    <SitePage>
      <Notice
        icon={Unplug}
        title="404: Halaman tidak ditemukan"
        body="Alamat ini tidak mengarah ke halaman mana pun."
        action={
          <Link to="/" className="btn btn-primary mt-6">
            Kembali ke Beranda
          </Link>
        }
      />
    </SitePage>
  );
}
