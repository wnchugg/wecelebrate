import { Card, CardContent } from "./ui/card";
import { Event } from "../data/mockData";

export interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card>
      <CardContent>
        <h3>{event.title}</h3>
      </CardContent>
    </Card>
  );
}