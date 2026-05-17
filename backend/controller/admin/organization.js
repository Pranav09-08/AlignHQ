import { getAdminBootstrapData, getAdminReportsData } from '../../model/admin/organization.js';

export async function getBootstrap(req, res) {
  try {
    const data = await getAdminBootstrapData();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: 'Failed to load admin data' });
  }
}

export async function listReports(_req, res) {
  try {
    const reports = await getAdminReportsData();
    res.json({ success: true, ...reports });
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: error.message || 'Failed to load reports' });
  }
}
