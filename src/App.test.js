import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const products = [
  {
    id: 1,
    title: 'Soft Glow Cream',
    description: 'A gentle daily moisturizer.',
    category: 'beauty',
    brand: 'Glow',
    price: 80,
    rating: 4.2,
    discountPercentage: 10,
    thumbnail: 'cream.jpg',
  },
  {
    id: 2,
    title: 'Night Serum',
    description: 'A nourishing evening serum.',
    category: 'beauty',
    brand: 'Glow',
    price: 120,
    rating: 4.8,
    discountPercentage: 5,
    thumbnail: 'serum.jpg',
  },
  {
    id: 3,
    title: 'Studio Headphones',
    description: 'Comfortable wireless headphones.',
    category: 'electronics',
    brand: 'Sound',
    price: 200,
    rating: 4.7,
    discountPercentage: 0,
    thumbnail: 'headphones.jpg',
  },
];

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ products }),
  });
});

afterEach(() => {
  delete global.fetch;
});

test('loads products and combines category, brand, rating, and price filters', async () => {
  render(<App />);

  await waitFor(() => expect(screen.getByText('3 products')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(
    'https://dummyjson.com/products?limit=0',
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );

  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'beauty' } });
  fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Glow' } });
  fireEvent.change(screen.getByLabelText('Minimum rating'), { target: { value: '4.5' } });
  expect(screen.getByRole('heading', { name: 'Night Serum' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Soft Glow Cream' })).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Max price'), { target: { value: '100' } });
  expect(screen.getByText('No products match those filters.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(screen.getByRole('heading', { name: 'Soft Glow Cream' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Studio Headphones' })).toBeInTheDocument();
});
