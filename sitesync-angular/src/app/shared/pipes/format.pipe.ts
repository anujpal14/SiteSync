// src/app/shared/pipes/format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inrFormat', standalone: true })
export class InrFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
    if (value >= 100_000)    return `₹${(value / 100_000).toFixed(1)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
  }
}

@Pipe({ name: 'ssDate', standalone: true })
export class SsDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return value; }
  }
}

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    return name.trim().split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
  }
}

// Shared utility functions
export function avatarColor(index: number): string {
  const colors = ['#6c63ff','#4ecdc4','#43e8a0','#ffa94d','#ff6b6b','#a78bfa','#34d399'];
  return colors[index % colors.length];
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: '#43e8a0', hold: '#ffa94d', done: '#6c63ff',
    present: '#43e8a0', absent: '#ff6b6b', 'half-day': '#ffa94d',
    paid: '#43e8a0', pending: '#ffa94d', sent: '#4ecdc4', overdue: '#ff6b6b',
    active_inv: '#43e8a0', inactive: '#ffa94d',
  };
  return map[status] ?? '#8a899a';
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Active', hold: 'On Hold', done: 'Complete',
    present: 'Present', absent: 'Absent', 'half-day': 'Half Day',
    paid: 'Paid', pending: 'Pending', sent: 'Sent', overdue: 'Overdue',
    inactive: 'Inactive',
  };
  return map[status] ?? status;
}
