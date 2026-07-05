import { Job } from 'bullmq';
import { logger } from '../../config/logger';
import { Report } from '../../models/Report';

export async function processReportGeneration(job: Job): Promise<void> {
  const { reportId, type, dateRange, format, filters } = job.data;
  logger.info('Processing report generation', { jobId: job.id, reportId, type });

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    const mockData = {
      generatedAt: new Date().toISOString(),
      type,
      dateRange,
      filters,
      records: 150,
      summary: `${type} report generated for ${dateRange.start} to ${dateRange.end}`,
    };

    report.status = 'completed';
    report.data = mockData;
    report.fileUrl = `/reports/${reportId}.${format}`;
    report.fileSize = 1024 * 50;
    await report.save();

    logger.info('Report generated successfully', { jobId: job.id, reportId });
  } catch (error) {
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      errorMessage: (error as Error).message,
    });
    throw error;
  }
}
