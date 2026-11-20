import { useEffect, useMemo, useState } from 'react';

const API_URL = 'https://dummyjson.com/products?limit=0';

function labelFor(value) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('featured');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Could not load products. Please try again.');
        const data = await response.json();
        if (!Array.isArray(data.products)) {
          throw new Error('The product service returned an invalid response.');
        }
        setProducts(data.products);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Something went wrong while loading products.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [reloadKey]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    [products]
  );
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((product) => product.price), 100) / 50) * 50,
    [products]
  );
  const shownPrice = maxPrice ?? priceCeiling;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const searchableText = [
        product.title,
        product.description,
        product.brand,
        product.category,
        ...(product.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (!category || product.category === category) &&
        (!brand || product.brand === brand) &&
        product.price <= shownPrice &&
        product.rating >= minRating
      );
    });

    if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'name') result.sort((a, b) => a.title.localeCompare(b.title));
    return result;
  }, [products, search, category, brand, shownPrice, minRating, sort]);

  function clearFilters() {
    setSearch('');
    setCategory('');
    setBrand('');
    setMaxPrice(null);
    setMinRating(0);
    setSort('featured');
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M5 8h14l-1 12H6L5 8Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            product<span className="-ml-2 text-emerald-700">finds</span>
          </a>
           <a href="#products" className="text-sm font-semibold text-stone-700 hover:text-emerald-700">
            Shop all
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            The everyday edit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Find your next favorite.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
            A little bit of everything, picked for your everyday.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
              >
                Clear all
              </button>
            </div>

            <label htmlFor="search" className="mb-2 block text-sm font-medium text-stone-700">
              Search
            </label>
            <div className="relative mb-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, brand, category..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-stone-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{labelFor(item)}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="brand" className="mb-2 block text-sm font-medium text-stone-700">
                Brand
              </label>
              <select
                id="brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All brands</option>
                {brands.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="price" className="text-sm font-medium text-stone-700">Max price</label>
                <span className="text-sm font-semibold text-stone-900">${shownPrice}</span>
              </div>
              <input
                id="price"
                type="range"
                min="0"
                max={priceCeiling}
                step="10"
                value={shownPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="mt-1 flex justify-between text-xs text-stone-400">
                <span>$0</span><span>${priceCeiling}</span>
              </div>
            </div>

            <div>
              <label htmlFor="rating" className="mb-2 block text-sm font-medium text-stone-700">
                Minimum rating
              </label>
              <select
                id="rating"
                value={minRating}
                onChange={(event) => setMinRating(Number(event.target.value))}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="0">Any rating</option>
                <option value="3">3 stars & up</option>
                <option value="4">4 stars & up</option>
                <option value="4.5">4.5 stars & up</option>
              </select>
            </div>
          </aside>

          <section id="products" aria-label="Products">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500" aria-live="polite">
                {loading ? 'Loading products...' : `${filteredProducts.length} products`}
              </p>
              <label className="flex items-center gap-2 text-sm text-stone-500">
                Sort by
                <select
                  aria-label="Sort products"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-medium text-stone-700 outline-none focus:border-emerald-600"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>

            {error ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <p className="font-medium text-stone-900">{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                Bringing the product finds to you...
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
                <p className="font-semibold text-stone-900">No products match those filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/60"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      {product.discountPercentage > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                          {Math.round(product.discountPercentage)}% off
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-xs font-medium capitalize text-stone-400">
                        {product.brand || labelFor(product.category)}
                      </p>
                      <h3 className="truncate font-semibold text-stone-900" title={product.title}>
                        {product.title}
                      </h3>
                      <p className="mt-1 min-h-10 text-sm leading-5 text-stone-500">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-stone-900">${product.price.toFixed(2)}</span>
                        <span className="flex items-center gap-1 text-sm font-medium text-stone-600" aria-label={`Rated ${product.rating} out of 5`}>
                          <span className="text-amber-500" aria-hidden="true">★</span>
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
