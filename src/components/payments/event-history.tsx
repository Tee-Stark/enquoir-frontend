import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentStateBadge } from "./payment-state-badge";
import type { components } from "@/lib/api/schema";

type RecordedEvent = components["schemas"]["RecordedEvent"];

function truncateHash(hash: string): string {
  return hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : hash;
}

export function EventHistory({ events }: { events: RecordedEvent[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Recorded</TableHead>
          <TableHead>Hash</TableHead>
          <TableHead>Prev hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.sequence_number}>
            <TableCell className="tabular-nums text-muted-foreground">
              {event.sequence_number}
            </TableCell>
            <TableCell>
              <PaymentStateBadge state={event.type} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(event.recorded_at).toLocaleString()}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground" title={event.hash}>
              {truncateHash(event.hash)}
            </TableCell>
            <TableCell
              className="font-mono text-xs text-muted-foreground"
              title={event.prev_hash}
            >
              {truncateHash(event.prev_hash)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
