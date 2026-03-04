'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface SourceBreakdownProps {
  data: { source: string; count: number }[];
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#84CC16'
];

const sourceLabels: Record<string, string> = {
  referral: 'Referral',
  recruiter_inbound: 'Recruiter (In)',
  recruiter_outbound: 'Recruiter (Out)',
  linkedin: 'LinkedIn',
  job_board: 'Job Board',
  vc_talent_network: 'VC Network',
  direct_application: 'Direct',
  networking: 'Networking',
  conference: 'Conference',
  other: 'Other'
};

export function SourceBreakdown({ data }: SourceBreakdownProps) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: sourceLabels[d.source] || d.source,
      value: d.count
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Source Breakdown</CardTitle>
          <CardDescription>Application sources</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No application source data yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Breakdown</CardTitle>
        <CardDescription>Where applications come from</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              dataKey='value'
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
