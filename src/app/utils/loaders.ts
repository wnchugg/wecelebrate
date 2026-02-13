/**
 * Route Loader Functions
 * Data loaders for React Router routes
 */

import type { LoaderFunctionArgs } from 'react-router';
import { api } from '../lib/apiClientExtended';
import type { Client, Site, Gift, Employee, Order, Event } from '../types';

/**
 * Loader result types
 */
export interface LoaderResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Handle loader errors consistently
 */
function handleLoaderError<T>(error: unknown): LoaderResult<T> {
  const message = error instanceof Error ? error.message : 'Failed to load data';
  console.error('Loader error:', error);
  return { data: null, error: message };
}

/**
 * Client loaders
 */
export async function clientsLoader(): Promise<LoaderResult<Client[]>> {
  try {
    const clients = await api.getClients();
    return { data: clients, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function clientLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Client>> {
  try {
    const { clientId } = params;
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const client = await api.getClient(clientId);
    return { data: client, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Site loaders
 */
export async function sitesLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Site[]>> {
  try {
    const { clientId } = params;
    const sites = clientId 
      ? await api.getSitesByClient(clientId)
      : await api.getSites();
    return { data: sites, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function siteLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Site>> {
  try {
    const { siteId } = params;
    if (!siteId) {
      throw new Error('Site ID is required');
    }
    
    const site = await api.getSite(siteId);
    return { data: site, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Gift loaders
 */
export async function giftsLoader({ request }: LoaderFunctionArgs): Promise<LoaderResult<Gift[]>> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const search = url.searchParams.get('search') || undefined;
    
    const gifts = await api.getGifts({ category, search });
    return { data: gifts, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function giftLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Gift>> {
  try {
    const { giftId } = params;
    if (!giftId) {
      throw new Error('Gift ID is required');
    }
    
    const gift = await api.getGift(giftId);
    return { data: gift, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Employee loaders
 */
export async function employeesLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Employee[]>> {
  try {
    const { siteId } = params;
    if (!siteId) {
      throw new Error('Site ID is required');
    }
    
    const employees = await api.getEmployees(siteId);
    return { data: employees, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function employeeLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Employee>> {
  try {
    const { employeeId } = params;
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    
    const employee = await api.getEmployee(employeeId);
    return { data: employee, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Order loaders
 */
export async function ordersLoader({ request, params }: LoaderFunctionArgs): Promise<LoaderResult<Order[]>> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const { siteId } = params;
    
    const orders = await api.getOrders({ siteId, status });
    return { data: orders, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function orderLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Order>> {
  try {
    const { orderId } = params;
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    const order = await api.getOrder(orderId);
    return { data: order, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Event loaders
 */
export async function eventsLoader({ request }: LoaderFunctionArgs): Promise<LoaderResult<Event[]>> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    
    const events = await api.getEvents({ status, search });
    return { data: events, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function eventLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Event>> {
  try {
    const { eventId } = params;
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    
    const event = await api.getEvent(eventId);
    return { data: event, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Dashboard loaders
 */
export async function adminDashboardLoader(): Promise<LoaderResult<{
  clientCount: number;
  siteCount: number;
  orderCount: number;
  recentOrders: Order[];
}>> {
  try {
    const [clients, sites, orders] = await Promise.all([
      api.getClients(),
      api.getSites(),
      api.getOrders({ limit: 5 }),
    ]);
    
    return {
      data: {
        clientCount: clients.length,
        siteCount: sites.length,
        orderCount: orders.length,
        recentOrders: orders.slice(0, 5),
      },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function userDashboardLoader(): Promise<LoaderResult<{
  activeEvents: Event[];
  pastOrders: Order[];
  availableGifts: Gift[];
}>> {
  try {
    const [events, orders, gifts] = await Promise.all([
      api.getEvents({ status: 'active' }),
      api.getOrders({ status: 'completed', limit: 5 }),
      api.getGifts({ limit: 12 }),
    ]);
    
    return {
      data: {
        activeEvents: events,
        pastOrders: orders,
        availableGifts: gifts,
      },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Settings loaders
 */
export async function siteSettingsLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Site>> {
  try {
    const { siteId } = params;
    if (!siteId) {
      throw new Error('Site ID is required');
    }
    
    const site = await api.getSite(siteId);
    return { data: site, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

export async function clientSettingsLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<Client>> {
  try {
    const { clientId } = params;
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const client = await api.getClient(clientId);
    return { data: client, error: null };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Catalog loaders
 */
export async function catalogLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<{
  gifts: Gift[];
  categories: string[];
}>> {
  try {
    const { siteId } = params;
    
    const gifts = await api.getGifts({ siteId });
    const categories = [...new Set(gifts.map(g => g.category))];
    
    return {
      data: { gifts, categories },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Report loaders
 */
export async function reportsLoader({ request }: LoaderFunctionArgs): Promise<LoaderResult<{
  orders: Order[];
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}>> {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    
    const orders = await api.getOrders({ startDate, endDate });
    
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + ((order.gift?.price ?? 0) * (order.quantity ?? 1)), 0);
    const ordersByStatus = orders.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      data: { orders, totalRevenue, ordersByStatus },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Search loader
 */
export async function searchLoader({ request }: LoaderFunctionArgs): Promise<LoaderResult<{
  gifts: Gift[];
  events: Event[];
}>> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (!query) {
      return { data: { gifts: [], events: [] }, error: null };
    }
    
    const [gifts, events] = await Promise.all([
      api.getGifts({ search: query }),
      api.getEvents({ search: query }),
    ]);
    
    return {
      data: { gifts, events },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Public site loader
 */
export async function publicSiteLoader({ params }: LoaderFunctionArgs): Promise<LoaderResult<{
  site: Site;
  gifts: Gift[];
}>> {
  try {
    const { siteId } = params;
    if (!siteId) {
      throw new Error('Site ID is required');
    }
    
    const [site, gifts] = await Promise.all([
      api.getSite(siteId),
      api.getGifts({ siteId }),
    ]);
    
    return {
      data: { site, gifts },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}

/**
 * Profile loader
 */
export async function profileLoader(): Promise<LoaderResult<{
  user: any;
  orders: Order[];
}>> {
  try {
    // Assuming there's a getCurrentUser method
    const user = await api.getCurrentUser?.();
    const orders = await api.getOrders({ userId: user?.id });
    
    return {
      data: { user, orders },
      error: null,
    };
  } catch (error) {
    return handleLoaderError(error);
  }
}