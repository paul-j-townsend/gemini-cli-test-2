// Lazy load admin client to avoid importing on client side
const getSupabaseAdmin = async () => {
  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  return supabaseAdmin;
};
import { Series, SeriesTable } from '@/types/database';

interface CreateSeriesData {
  name: string;
  slug: string;
  description?: string;
  thumbnail_path?: string;
  display_order?: number;
}

interface UpdateSeriesData {
  name?: string;
  slug?: string;
  description?: string;
  thumbnail_path?: string;
  display_order?: number;
  is_active?: boolean;
}

class SeriesService {
  async createSeries(data: CreateSeriesData): Promise<Series> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data: series, error } = await supabaseAdmin
      .from('vsk_series')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        thumbnail_path: data.thumbnail_path || null,
        display_order: data.display_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating series:', error);
      throw new Error(`Failed to create series: ${error.message}`);
    }

    return series;
  }

  async updateSeries(id: string, data: UpdateSeriesData): Promise<Series> {
    const supabaseAdmin = await getSupabaseAdmin();
    const updateData: Partial<SeriesTable> = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.thumbnail_path !== undefined) updateData.thumbnail_path = data.thumbnail_path;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: series, error } = await supabaseAdmin
      .from('vsk_series')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating series:', error);
      throw new Error(`Failed to update series: ${error.message}`);
    }

    return series;
  }

  async updateSeriesOrder(seriesOrderUpdates: { id: string; display_order: number }[]): Promise<void> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin.rpc('update_series_order', {
      series_updates: seriesOrderUpdates
    });

    if (error) {
      // Fallback to individual updates if RPC function doesn't exist
      const updatePromises = seriesOrderUpdates.map(update =>
        supabaseAdmin
          .from('vsk_series')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );

      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.error('Error updating series order:', failures);
        throw new Error('Failed to update series order');
      }
    }
  }

  async getSeries(includeInactive = false): Promise<Series[]> {
    const supabaseAdmin = await getSupabaseAdmin();
    let query = supabaseAdmin
      .from('vsk_series')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: series, error } = await query;

    if (error) {
      console.error('Error fetching series:', error);
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return series || [];
  }

  async getSeriesById(id: string): Promise<Series | null> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data: series, error } = await supabaseAdmin
      .from('vsk_series')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Series not found
      }
      console.error('Error fetching series by ID:', error);
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return series;
  }

  async getSeriesBySlug(slug: string): Promise<Series | null> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data: series, error } = await supabaseAdmin
      .from('vsk_series')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Series not found
      }
      console.error('Error fetching series by slug:', error);
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return series;
  }

  async deleteSeries(id: string): Promise<void> {
    const supabaseAdmin = await getSupabaseAdmin();
    // First check if any content is assigned to this series
    const { data: contentCount, error: countError } = await supabaseAdmin
      .from('vsk_content')
      .select('id', { count: 'exact' })
      .eq('series_id', id);

    if (countError) {
      console.error('Error checking content assignment:', countError);
      throw new Error('Failed to check content assignment');
    }

    if (contentCount && contentCount.length > 0) {
      throw new Error('Cannot delete series: content is still assigned to this series');
    }

    const { error } = await supabaseAdmin
      .from('vsk_series')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting series:', error);
      throw new Error(`Failed to delete series: ${error.message}`);
    }
  }

  async getContentBySeries(seriesId: string): Promise<any[]> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data: content, error } = await supabaseAdmin
      .from('vsk_content')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .order('episode_number', { ascending: true });

    if (error) {
      console.error('Error fetching content by series:', error);
      throw new Error(`Failed to fetch content for series: ${error.message}`);
    }

    return content || [];
  }

  async assignContentToSeries(contentId: string, seriesId: string | null): Promise<void> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('vsk_content')
      .update({ series_id: seriesId })
      .eq('id', contentId);

    if (error) {
      console.error('Error assigning content to series:', error);
      throw new Error(`Failed to assign content to series: ${error.message}`);
    }
  }

  async getSeriesWithContentCount(): Promise<(Series & { content_count: number })[]> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data: seriesWithCount, error } = await supabaseAdmin
      .from('vsk_series')
      .select(`
        *,
        content_count:vsk_content(count)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching series with content count:', error);
      throw new Error(`Failed to fetch series with content count: ${error.message}`);
    }

    return seriesWithCount?.map(series => ({
      ...series,
      content_count: Array.isArray(series.content_count) ? series.content_count.length : 0
    })) || [];
  }
}

export const seriesService = new SeriesService();
export default seriesService;