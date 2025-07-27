import { supabaseAdmin } from '@/lib/supabase-admin';

export interface UserContentProgress {
  id?: string;
  user_id: string;
  content_id: string;
  has_listened: boolean;
  listen_progress_percentage: number;
  listened_at?: string;
  quiz_completed: boolean;
  quiz_completed_at?: string;
  report_downloaded: boolean;
  report_downloaded_at?: string;
  certificate_downloaded: boolean;
  certificate_downloaded_at?: string;
  created_at?: string;
  updated_at?: string;
}

class UserContentProgressService {
  async getProgress(userId: string, contentId: string): Promise<UserContentProgress | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user content progress:', error);
        return null;
      }

      return data as UserContentProgress | null;
    } catch (error) {
      console.error('Error getting user content progress:', error);
      return null;
    }
  }

  async updateListenProgress(
    userId: string, 
    contentId: string, 
    progressPercentage: number, 
    hasListened: boolean = false
  ): Promise<UserContentProgress | null> {
    try {
      const updateData: Partial<UserContentProgress> = {
        listen_progress_percentage: progressPercentage,
        has_listened: hasListened,
        ...(hasListened && { listened_at: new Date().toISOString() })
      };

      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          ...updateData
        }, {
          onConflict: 'user_id,content_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating listen progress:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Update data was:', { user_id: userId, content_id: contentId, ...updateData });
        
        // Re-throw error so API can handle it properly
        throw error;
      }

      return data as UserContentProgress;
    } catch (error) {
      console.error('Exception in updateListenProgress:', error);
      // Re-throw error so API can handle it properly
      throw error;
    }
  }

  async markQuizCompleted(userId: string, contentId: string): Promise<UserContentProgress | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          quiz_completed: true,
          quiz_completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking quiz completed:', error);
        return null;
      }

      return data as UserContentProgress;
    } catch (error) {
      console.error('Error marking quiz completed:', error);
      return null;
    }
  }

  async markReportDownloaded(userId: string, contentId: string): Promise<UserContentProgress | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .upsert({
          user_id: userId,
          content_id: contentId,
          report_downloaded: true
          // Temporarily removed report_downloaded_at to test
        }, {
          onConflict: 'user_id,content_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking report downloaded:', error);
        return null;
      }

      return data as UserContentProgress;
    } catch (error) {
      console.error('Error marking report downloaded:', error);
      return null;
    }
  }

  async markCertificateDownloaded(userId: string, contentId: string): Promise<UserContentProgress | null> {
    try {
      console.log('markCertificateDownloaded called with:', { userId, contentId });
      
      const updateData = {
        user_id: userId,
        content_id: contentId,
        certificate_downloaded: true
        // Temporarily removed certificate_downloaded_at to test
      };
      
      console.log('Update data:', updateData);
      
      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .upsert(updateData, {
          onConflict: 'user_id,content_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error in markCertificateDownloaded:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      console.log('Successfully marked certificate downloaded:', data);
      return data as UserContentProgress;
    } catch (error) {
      console.error('Exception in markCertificateDownloaded:', error);
      console.error('Exception details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return null;
    }
  }

  async getUserProgressSummary(userId: string): Promise<{
    totalContent: number;
    listened: number;
    quizzesCompleted: number;
    reportsDownloaded: number;
    certificatesDownloaded: number;
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_user_content_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user progress summary:', error);
        return {
          totalContent: 0,
          listened: 0,
          quizzesCompleted: 0,
          reportsDownloaded: 0,
          certificatesDownloaded: 0
        };
      }

      const progress = data as UserContentProgress[];
      
      return {
        totalContent: progress.length,
        listened: progress.filter(p => p.has_listened).length,
        quizzesCompleted: progress.filter(p => p.quiz_completed).length,
        reportsDownloaded: progress.filter(p => p.report_downloaded).length,
        certificatesDownloaded: progress.filter(p => p.certificate_downloaded).length
      };
    } catch (error) {
      console.error('Error getting user progress summary:', error);
      return {
        totalContent: 0,
        listened: 0,
        quizzesCompleted: 0,
        reportsDownloaded: 0,
        certificatesDownloaded: 0
      };
    }
  }
}

export const userContentProgressService = new UserContentProgressService();
export default userContentProgressService;