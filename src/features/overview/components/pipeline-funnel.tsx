'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface PipelineFunnelProps {
  data: { status: string; count: number }[];
}

const stageOrder = [
  'researching',
  'applied',
  'recruiter_screen',
  'phone_interview',
  'onsite',
  'final_round',
  'offer',
  'negotiating'
];

const stageLabels: Record<string, string> = {
  researching: 'Research',
  applied: 'Applied',
  recruiter_screen: 'Screen',
  phone_interview: 'Phone',
  onsite: 'Onsite',
  final_round: 'Final',
  offer: 'Offer',
  negotiating: 'Negotiate'
};

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const chartData = stageOrder.map((status) => ({
    name: stageLabels[status] || status,
    count: data.find((d) => d.status === status)?.count || 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
        <CardDescription>Applications by pipeline stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey='name' fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey='count' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
