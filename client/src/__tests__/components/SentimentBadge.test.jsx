import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SentimentBadge from '../../components/SentimentBadge';

describe('SentimentBadge', () => {
  it('renders Positive sentiment with correct styling', () => {
    render(<SentimentBadge sentiment="Positive" />);
    
    const badge = screen.getByText('Positive');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-emerald-400');
  });

  it('renders Negative sentiment with correct styling', () => {
    render(<SentimentBadge sentiment="Negative" />);
    
    const badge = screen.getByText('Negative');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-400');
  });

  it('renders Neutral sentiment with correct styling', () => {
    render(<SentimentBadge sentiment="Neutral" />);
    
    const badge = screen.getByText('Neutral');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-yellow-400');
  });

  it('renders unknown sentiment with fallback styling', () => {
    render(<SentimentBadge sentiment="Unknown" />);
    
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-700');
  });

  it('has rounded-full class for pill shape', () => {
    render(<SentimentBadge sentiment="Positive" />);
    
    const badge = screen.getByText('Positive');
    expect(badge).toHaveClass('rounded-full');
  });

  it('has transition classes for animation', () => {
    render(<SentimentBadge sentiment="Neutral" />);
    
    const badge = screen.getByText('Neutral');
    expect(badge).toHaveClass('transition-all');
  });
});
