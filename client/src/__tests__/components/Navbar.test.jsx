import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../../components/Navbar';

describe('Navbar', () => {
  it('renders the brand title', () => {
    render(<Navbar onSearch={() => {}} />);
    
    expect(screen.getByText('StockSent AI')).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(<Navbar onSearch={() => {}} />);
    
    const input = screen.getByPlaceholderText(/Search stock/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch when search button is clicked with valid input', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<Navbar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search stock/i);
    await user.type(input, 'AAPL');
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('AAPL');
  });

  it('calls onSearch when Enter key is pressed', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<Navbar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search stock/i);
    await user.type(input, 'TSLA{enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('TSLA');
  });

  it('does not call onSearch when input is empty', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<Navbar onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('trims whitespace from search term', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<Navbar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search stock/i);
    await user.type(input, '  MSFT  {enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('MSFT');
  });

  it('does not call onSearch when only whitespace is entered', async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    
    render(<Navbar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search stock/i);
    await user.type(input, '   {enter}');
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('has sticky positioning', () => {
    const { container } = render(<Navbar onSearch={() => {}} />);
    
    const navbar = container.firstChild;
    expect(navbar).toHaveClass('sticky');
    expect(navbar).toHaveClass('top-0');
  });
});
