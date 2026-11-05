import { useState } from 'react';
import { categoryCover, categoryIcon } from '../config/catalog';

/**
 * A soft gradient per category, or the service's own image when it has one.
 * With children it becomes a poster: the card's text sits on it over a scrim.
 */
export default function ServiceCover({ service, large = false, className = '', children }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = categoryIcon(service.category);
  const showImage = service.image_url && !imageFailed;

  return (
    <div className={`cover ${categoryCover(service.category)} ${children ? 'cover--poster' : ''} ${className}`}>
      {showImage ? (
        <img
          src={service.image_url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      ) : (
        <>
          <Icon aria-hidden className={`cover__mark ${large ? 'size-40 sm:size-56' : 'size-32'}`} strokeWidth={1.25} />
          {!children && (
            <span
              aria-hidden
              className="absolute bottom-3 left-3 inline-flex size-10 items-center justify-center rounded-xl bg-black/25 text-white ring-1 ring-white/15"
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
          )}
        </>
      )}
      {children}
    </div>
  );
}
