import { Site } from '../context/SiteContext';

export function isWithinAvailabilityPeriod(site: Site | null): boolean {
  if (!site) return true;

  const { availabilityStartDate, availabilityEndDate } = site.settings;

  // If no dates are configured, the site is always available
  if (!availabilityStartDate && !availabilityEndDate) {
    return true;
  }

  const now = new Date();

  // Check start date
  if (availabilityStartDate) {
    const startDate = new Date(availabilityStartDate);
    if (now < startDate) {
      return false; // Site not yet available
    }
  }

  // Check end date
  if (availabilityEndDate) {
    const endDate = new Date(availabilityEndDate);
    if (now > endDate) {
      return false; // Site expired
    }
  }

  return true;
}

export function isSiteExpired(site: Site | null): boolean {
  if (!site) return false;

  const { availabilityEndDate } = site.settings;

  // If no end date is configured, the site never expires
  if (!availabilityEndDate) {
    return false;
  }

  const now = new Date();
  const endDate = new Date(availabilityEndDate);

  return now > endDate;
}

export function isSiteNotYetAvailable(site: Site | null): boolean {
  if (!site) return false;

  const { availabilityStartDate } = site.settings;

  // If no start date is configured, the site is immediately available
  if (!availabilityStartDate) {
    return false;
  }

  const now = new Date();
  const startDate = new Date(availabilityStartDate);

  return now < startDate;
}