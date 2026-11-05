import { seedServices } from '../data/seedServices';
import { isSupabaseConfigured, supabase } from '../lib/SupabaseClient';

export async function fetchServices() {
  if (!isSupabaseConfigured) return seedServices;

  const { data, error } = await supabase
    .from('services')
    .select('id, title, category, description, price, status, image_url')
    .order('category')
    .order('price');

  if (error) throw error;
  return data;
}

/** Returns a Map of service id to completed orders. */
export async function fetchCompletedCounts() {
  if (!isSupabaseConfigured) {
    return new Map(seedServices.map((service) => [service.id, service.demoCompleted]));
  }

  const { data, error } = await supabase.rpc('service_completed_counts');
  if (error) throw error;
  return new Map(data.map((row) => [row.service_id, Number(row.completed_count)]));
}
