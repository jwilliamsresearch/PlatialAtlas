"use client";
import { useEffect, useRef } from 'react';
import { Box, Typography, Stack, Chip, Paper } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FACETS } from '@/lib/facets';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type Props = {
  data: { h3: string; n: number; cats?: Record<string, number> } | null;
};

// Generate a normalized color palette with good distribution
const generateColors = (count: number) => {
  const colors = [];
  const saturation = 65;
  const lightness = 55;
  
  for (let i = 0; i < count; i++) {
    // Use golden ratio for better color distribution
    const hue = (i * 137.508) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
};

export default function AreaStatistics({ data }: Props) {
  const chartRef = useRef<ChartJS<"doughnut", number[], string> | null>(null);

  useEffect(() => {
    // Force chart re-render when data changes
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  if (!data || data.n === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem', fontWeight: 500 }}>
          Hexagon Statistics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on a hexagon on the map to view detailed statistics for that area.
        </Typography>
      </Paper>
    );
  }

  const cats = data.cats || {};
  const hasCategories = Object.keys(cats).length > 0;
  
  // Prepare data for donut chart
  const chartData = hasCategories ? Object.entries(cats)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a) // Sort by count descending
    .map(([category, count]) => ({
      category,
      count,
      label: FACETS.find(f => f.key === category)?.label || category
    })) : [];

  // Calculate source breakdown
  const sourceBreakdown = hasCategories 
    ? Object.entries(cats).reduce((acc, [category, count]) => {
        const facet = FACETS.find(f => f.key === category);
        const source = facet?.group || 'unknown';
        acc[source] = (acc[source] || 0) + count;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const sourceData = Object.entries(sourceBreakdown)
    .map(([source, count]) => ({
      source,
      label: source === 'osm' ? 'OpenStreetMap' : source === 'overture' ? 'Overture Maps' : source,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const colors = generateColors(chartData.length);
  const sourceColors = generateColors(sourceData.length);

  const chartConfig = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        data: chartData.map(item => item.count),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('55%', '45%')), // Darker borders
        borderWidth: 2,
        hoverBackgroundColor: colors.map(color => color.replace('55%', '65%')), // Lighter on hover
        hoverBorderWidth: 3,
      },
    ],
  };

  const sourceChartConfig = {
    labels: sourceData.map(item => item.label),
    datasets: [
      {
        label: 'POIs by Source',
        data: sourceData.map(item => item.count),
        backgroundColor: sourceColors,
        borderColor: sourceColors.map(color => color.replace('55%', '45%')),
        borderWidth: 2,
        hoverBackgroundColor: sourceColors.map(color => color.replace('55%', '65%')),
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create our own legend
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const percentage = ((context.parsed / data.n) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%', // Makes it a donut instead of pie
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const percentage = ((context.parsed.y / data.n) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.y} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 0,
        },
      },
    },
  };

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
        Hexagon Statistics
      </Typography>
      
      <Stack spacing={2}>
        {/* H3 Cell Info */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            H3 Cell: <code style={{ fontSize: '0.8em', background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              {data.h3}
            </code>
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {data.n.toLocaleString()} POIs
          </Typography>
        </Box>

        {/* Donut Chart */}
        {hasCategories && chartData.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Category Breakdown
            </Typography>
            <Box sx={{ height: 200, position: 'relative' }}>
              <Doughnut ref={chartRef} data={chartConfig} options={chartOptions} />
            </Box>
          </Box>
        )}

        {/* Source Breakdown Bar Chart */}
        {hasCategories && sourceData.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Data Sources
            </Typography>
            <Box sx={{ height: 150, position: 'relative' }}>
              <Bar data={sourceChartConfig} options={barChartOptions} />
            </Box>
          </Box>
        )}

        {/* Category Legend/List */}
        {hasCategories && chartData.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Categories
            </Typography>
            <Stack spacing={1}>
              {chartData.map((item, index) => {
                const percentage = ((item.count / data.n) * 100).toFixed(1);
                return (
                  <Box
                    key={item.category}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: colors[index],
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* No categories message */}
        {!hasCategories && (
          <Typography variant="body2" color="text.secondary">
            No category breakdown available for this area.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
