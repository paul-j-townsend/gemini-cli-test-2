export class DownloadService {
  
  static async downloadLearningReport(userId: string, contentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/downloads/learning-report?userId=${userId}&contentId=${contentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get download link');
      }
      
      const data = await response.json();
      
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading learning report:', error);
      throw error;
    }
  }

  static async downloadPodcast(userId: string, contentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/downloads/podcast?userId=${userId}&contentId=${contentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get download link');
      }
      
      const data = await response.json();
      
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading podcast:', error);
      throw error;
    }
  }

  static async downloadCertificate(userId: string, contentId: string): Promise<void> {
    try {
      // Use existing certificate download functionality
      // This will need to be integrated with the existing Certificate component
      const response = await fetch(`/api/downloads/certificate?userId=${userId}&contentId=${contentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get certificate');
      }
      
      // Certificate download logic will be handled by existing Certificate component
      // This method serves as a placeholder for future certificate API integration
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }
}