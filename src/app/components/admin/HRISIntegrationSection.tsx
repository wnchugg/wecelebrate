import { HRISIntegrationTab } from './HRISIntegrationTab';

interface Client {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
  isActive: boolean;
}

interface HRISIntegrationSectionProps {
  client: Client;
  sites: Site[];
  onSyncComplete: () => void;
}

export function HRISIntegrationSection({ client, sites, onSyncComplete }: HRISIntegrationSectionProps) {
  return (
    <HRISIntegrationTab 
      client={client} 
      sites={sites}
    />
  );
}