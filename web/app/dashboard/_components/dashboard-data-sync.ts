export const DASHBOARD_DATA_SYNC_EVENT = "dashboard-data-sync";

export const dispatchDashboardDataSync = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DASHBOARD_DATA_SYNC_EVENT));
};
