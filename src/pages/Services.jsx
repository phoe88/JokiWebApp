import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import ServiceCatalog from '../components/ServiceCatalog';
import { ALL_CATEGORY, CATEGORY_TABS } from '../config/catalog';

export default function Services() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');

  const requested = params.get('category');
  const initialCategory = CATEGORY_TABS.includes(requested) ? requested : ALL_CATEGORY;

  return (
    <div className="pt-6">
      <PageHeader
        eyebrow="Marketplace"
        title="Services"
        description="Every package in the catalog. Filter by category or search by what you need built."
      />
      <SearchBar value={query} onChange={setQuery} className="mt-5" />
      <ServiceCatalog key={initialCategory} query={query} onQueryChange={setQuery} initialCategory={initialCategory} />
    </div>
  );
}
