import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StockCard from '../../components/StockCard';

describe('StockCard', () => {
  it('renders with title and value', () => {
    render(<StockCard title="P/E Ratio" value="25.50" />);
    
    expect(screen.getByText('P/E Ratio')).toBeInTheDocument();
    expect(screen.getByText('25.50')).toBeInTheDocument();
  });

  it('renders with N/A value', () => {
    render(<StockCard title="EPS" value="N/A" />);
    
    expect(screen.getByText('EPS')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders with price format', () => {
    render(<StockCard title="Price" value="$175.50" />);
    
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('$175.50')).toBeInTheDocument();
  });

  it('renders with numeric value', () => {
    render(<StockCard title="Market Cap" value="2.5T" />);
    
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    expect(screen.getByText('2.5T')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(<StockCard title="Test" value="123" />);
    
    // Should have gray background
    expect(container.firstChild).toHaveClass('bg-gray-900/70');
  });
});
