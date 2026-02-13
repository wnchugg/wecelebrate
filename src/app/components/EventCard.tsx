import { useEffect, useState } from 'react';
import { Link } from "react-router";
import { Calendar, Gift, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Event } from "../data/mockData";
import { format } from "date-fns";

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