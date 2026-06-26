/**
 * Copyright (c) 2024 Inso Code
 *
 * ROLE-BASED DASHBOARD BUILDER (Phase 62)
 *
 * Dynamic dashboards:
 *   - Widget library (15 types: charts, tables, KPIs, maps, etc.)
 *   - Layout persistence per user/role
 *   - Real-time data binding with configurable refresh
 *   - Dashboard templates with role-based access
 *   - Widget configuration with filters, thresholds, actions
 *   - Share/clone dashboards across teams
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════
// Widget Types
// ═══════════════════════════════════════════════

const WIDGET_TYPES = {
  bar_chart: { category: 'chart', description: 'Bar chart visualization' },
  line_chart: { category: 'chart', description: 'Time-series line chart' },
  pie_chart: { category: 'chart', description: 'Pie/donut chart' },
  area_chart: { category: 'chart', description: 'Stacked area chart' },
  scatter_plot: {
    category: 'chart',
    description: 'Scatter plot / bubble chart',
  },
  table: { category: 'data', description: 'Data table with sort/filter' },
  kpi_card: { category: 'metric', description: 'Single KPI with trend arrow' },
  gauge: { category: 'metric', description: 'Gauge meter (0-100)' },
  stat_card: { category: 'metric', description: 'Stats card with spark line' },
  heat_map: { category: 'map', description: 'Geographic heat map' },
  activity_feed: { category: 'feed', description: 'Real-time activity stream' },
  markdown: { category: 'content', description: 'Rich text / markdown' },
  iframe: { category: 'embed', description: 'Embedded external content' },
  alert_list: { category: 'status', description: 'Active alerts / incidents' },
  topology: { category: 'diagram', description: 'System topology / graph' },
};

const DASHBOARD_TEMPLATES = {
  executive: {
    name: 'Executive Overview',
    widgets: [
      'kpi_card',
      'line_chart',
      'pie_chart',
      'stat_card',
      'activity_feed',
    ],
    roles: ['admin', 'executive'],
  },
  operations: {
    name: 'Operations Center',
    widgets: ['gauge', 'alert_list', 'topology', 'table', 'line_chart'],
    roles: ['admin', 'operator'],
  },
  developer: {
    name: 'Developer Portal',
    widgets: ['table', 'line_chart', 'stat_card', 'activity_feed', 'markdown'],
    roles: ['admin', 'developer'],
  },
  finance: {
    name: 'Cost & Billing',
    widgets: ['kpi_card', 'bar_chart', 'table', 'area_chart', 'stat_card'],
    roles: ['admin', 'finance'],
  },
};

class DashboardBuilder {
  constructor() {
    this.dashboards = new Map();
    this.widgets = new Map();
    this.stats = { totalDashboards: 0, totalWidgets: 0 };
  }

  // ── Dashboard CRUD ──

  createDashboard(config) {
    const {
      name,
      tenantId,
      userId,
      role = 'admin',
      template = null,
      layout = { columns: 12, rows: 'auto' },
      refreshInterval = 30,
    } = config;

    const dashboard = {
      id: `dash_${crypto.randomBytes(8).toString('hex')}`,
      name,
      tenantId,
      userId,
      role,
      layout,
      refreshInterval,
      widgets: [],
      shared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Apply template
    if (template && DASHBOARD_TEMPLATES[template]) {
      const tmpl = DASHBOARD_TEMPLATES[template];
      tmpl.widgets.forEach((type, i) => {
        const widget = this._createWidget(type, {
          position: {
            col: (i * 4) % 12,
            row: Math.floor(i / 3) * 4,
            w: 4,
            h: 4,
          },
        });
        dashboard.widgets.push(widget.id);
        this.widgets.set(widget.id, widget);
        this.stats.totalWidgets++;
      });
    }

    this.dashboards.set(dashboard.id, dashboard);
    this.stats.totalDashboards++;

    return {
      id: dashboard.id,
      name,
      widgets: dashboard.widgets.length,
      template,
    };
  }

  updateDashboard(dashboardId, updates) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);

    if (updates.name) dashboard.name = updates.name;
    if (updates.layout) dashboard.layout = updates.layout;
    if (updates.refreshInterval)
      dashboard.refreshInterval = updates.refreshInterval;
    dashboard.updatedAt = new Date().toISOString();

    return { id: dashboardId, updated: true };
  }

  deleteDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);
    // Clean up widgets
    for (const wId of dashboard.widgets) this.widgets.delete(wId);
    this.dashboards.delete(dashboardId);
    return { id: dashboardId, deleted: true };
  }

  // ── Widget Management ──

  addWidget(dashboardId, type, config = {}) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);
    if (!WIDGET_TYPES[type]) throw new Error(`Unknown widget type: ${type}`);

    const widget = this._createWidget(type, config);
    this.widgets.set(widget.id, widget);
    dashboard.widgets.push(widget.id);
    dashboard.updatedAt = new Date().toISOString();
    this.stats.totalWidgets++;

    return widget;
  }

  removeWidget(dashboardId, widgetId) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);
    dashboard.widgets = dashboard.widgets.filter(w => w !== widgetId);
    this.widgets.delete(widgetId);
    return { removed: true };
  }

  configureWidget(widgetId, config) {
    const widget = this.widgets.get(widgetId);
    if (!widget) throw new Error(`Widget not found: ${widgetId}`);

    if (config.dataSource) widget.dataSource = config.dataSource;
    if (config.position) widget.position = config.position;
    if (config.filters) widget.filters = config.filters;
    if (config.thresholds) widget.thresholds = config.thresholds;
    if (config.title) widget.title = config.title;
    widget.updatedAt = new Date().toISOString();

    return { id: widgetId, configured: true };
  }

  // ── Sharing ──

  shareDashboard(dashboardId) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard not found: ${dashboardId}`);
    dashboard.shared = true;
    return {
      id: dashboardId,
      shared: true,
      shareUrl: `/dashboards/shared/${dashboardId}`,
    };
  }

  cloneDashboard(dashboardId, newName, userId) {
    const source = this.dashboards.get(dashboardId);
    if (!source) throw new Error(`Dashboard not found: ${dashboardId}`);

    const cloned = this.createDashboard({
      name: newName || `${source.name} (Copy)`,
      tenantId: source.tenantId,
      userId,
      role: source.role,
      layout: { ...source.layout },
      refreshInterval: source.refreshInterval,
    });

    // Clone widgets
    for (const wId of source.widgets) {
      const srcWidget = this.widgets.get(wId);
      if (srcWidget) {
        const newWidget = this._createWidget(srcWidget.type, { ...srcWidget });
        this.widgets.set(newWidget.id, newWidget);
        this.dashboards.get(cloned.id).widgets.push(newWidget.id);
        this.stats.totalWidgets++;
      }
    }

    return cloned;
  }

  // ── Internal ──

  _createWidget(type, config = {}) {
    return {
      id: `widget_${crypto.randomBytes(6).toString('hex')}`,
      type,
      category: WIDGET_TYPES[type]?.category || 'unknown',
      title: config.title || WIDGET_TYPES[type]?.description || type,
      dataSource: config.dataSource || null,
      position: config.position || { col: 0, row: 0, w: 4, h: 4 },
      filters: config.filters || {},
      thresholds: config.thresholds || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ── Queries ──

  getDashboard(dashboardId) {
    return this.dashboards.get(dashboardId);
  }
  getWidget(widgetId) {
    return this.widgets.get(widgetId);
  }

  listDashboards(tenantId, userId) {
    const all = [...this.dashboards.values()];
    return all.filter(d => {
      if (tenantId && d.tenantId !== tenantId) return false;
      if (userId && d.userId !== userId && !d.shared) return false;
      return true;
    });
  }

  getTemplates() {
    return DASHBOARD_TEMPLATES;
  }
  getWidgetTypes() {
    return WIDGET_TYPES;
  }

  getStats() {
    return {
      totalDashboards: this.stats.totalDashboards,
      totalWidgets: this.stats.totalWidgets,
      widgetTypes: Object.keys(WIDGET_TYPES).length,
      templates: Object.keys(DASHBOARD_TEMPLATES).length,
      sharedDashboards: [...this.dashboards.values()].filter(d => d.shared)
        .length,
    };
  }
}

export const dashboardBuilder = new DashboardBuilder();
export { WIDGET_TYPES, DASHBOARD_TEMPLATES };
