# Contributing to AI Stock Market Sentiment Dashboard

Thank you for being interested in contributing! This document provides guidelines for contributing to this project.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/AI_Stock_Market_and_Sentiment_Dashboard.git
cd AI_StockMarketSummary_SentimentDashbord
git remote add upstream https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
# or
git checkout -b docs/my-docs
```

### 3. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Setup Environment

```bash
cd server
cp .env.example .env
# Fill in your API keys
```

### 5. Run Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

## Types of Contributions

### 🐛 Bug Reports

Create an issue with:
- Clear title describing the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, browser)
- Any error messages/logs

### ✨ Feature Requests

Create an issue with:
- Clear title and description
- Use case/motivation
- Proposed implementation
- Examples or mockups (if relevant)

### 📝 Documentation Improvements

- Fix typos
- Clarify confusing sections
- Add missing examples
- Improve API documentation

### 🔧 Code Contributions

Areas we welcome contributions:

**High Priority (Help Needed):**
- [ ] Add more unit tests (aim for 80%+ coverage)
- [ ] Improve error handling
- [ ] Add TypeScript types (optional)
- [ ] Performance optimizations
- [ ] Accessibility improvements (a11y)

**Medium Priority:**
- [ ] Additional stock indicators (RSI, MACD, etc.)
- [ ] More news sources
- [ ] Enhanced charting options
- [ ] Dark mode theme

**Lower Priority (Will Evaluate):**
- [ ] Major architecture changes
- [ ] Replacement of core dependencies
- [ ] Significant feature additions

## Development Workflow

### Before Committing

```bash
# 1. Format code (if Prettier is setup)
npm run format

# 2. Lint code
npm run lint

# 3. Run tests
npm test

# 4. Check no .env files are committed
git status | grep ".env"  # Should show nothing
```

### Commit Guidelines

```bash
# Use clear, descriptive commit messages
git commit -m "feat: add stock comparison feature"
git commit -m "fix: resolve CORS issue on watchlist update"
git commit -m "docs: update deployment guide"
git commit -m "test: add unit tests for aiService"

# Format: [type]: [description]
# Types: feat, fix, docs, test, style, refactor, perf
```

### Pull Request Process

1. **Update from upstream first**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

3. **Create Pull Request on GitHub**
   - Clear title and description
   - Reference related issues (`Closes #123`)
   - List changes made
   - Include before/after screenshots if UI change

4. **Review Process**
   - Automated tests must pass
   - Maintainer review (typically within a few days)
   - Address feedback
   - Approve and merge

## Code Style

### General Guidelines

- Use meaningful variable names
- Write comments for complex logic
- Keep functions small and focused
- Follow DRY principle (Don't Repeat Yourself)

### JavaScript/Node.js

```javascript
// ✅ Good
const fetchStockData = async (symbol) => {
  const validated = validateSymbol(symbol);
  const data = await cache.get(validated);
  if (data && !isStale(data)) {
    return data;
  }
  
  const fresh = await api.fetch(validated);
  await cache.set(validated, fresh);
  return fresh;
};

// ❌ Avoid
async function f(s){
  let d=await fetch(s);
  return d;
}
```

### React

```javascript
// ✅ Good component structure
export function StockDetail({ symbol }) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch logic
  }, [symbol]);
  
  if (loading) return <LoadingSpinner />;
  if (!stock) return <NotFound />;
  
  return (
    <div className="stock-detail">
      {/* JSX */}
    </div>
  );
}

// ❌ Avoid
export function S(p){
  const [s,u]=useState();
  return <div>{s}</div>;
}
```

### CSS/Tailwind

- Use utility classes from Tailwind
- Avoid inline styles
- Use responsive modifiers (sm:, md:, lg:)
- Maintain consistency with existing classes

## Testing Guidelines

### Backend (Jest)

```javascript
// ✅ Good test structure
describe('stockService', () => {
  test('should fetch stock data from cache if fresh', async () => {
    const mockCache = { get: jest.fn(() => mockData) };
    const result = await getStock('AAPL', mockCache);
    expect(result).toEqual(mockData);
    expect(mockCache.get).toHaveBeenCalledWith('AAPL');
  });

  test('should fetch from API if cache is stale', async () => {
    const mockCache = { get: jest.fn(() => staleData) };
    const mockApi = { fetch: jest.fn(() => freshData) };
    const result = await getStock('AAPL', mockCache, mockApi);
    expect(mockApi.fetch).toHaveBeenCalled();
  });
});
```

### Frontend (Vitest + RTL)

```javascript
// ✅ Good component test
test('should display stock details after loading', async () => {
  render(<StockDetail symbol="AAPL" />);
  
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
  });
});
```

## Documentation Standards

- Keep README updated with new features
- Add JSDoc comments to functions
- Document non-obvious logic
- Include usage examples for new features

```javascript
/**
 * Fetches stock data from cache or external API
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @param {number} cacheMaxAge - Cache validity in minutes (default: 30)
 * @returns {Promise<StockData>} Stock data with fundamentals and sentiment
 * @throws {Error} If symbol is invalid or API fails
 * 
 * @example
 * const stock = await getStock('AAPL');
 * console.log(stock.price, stock.sentiment);
 */
async function getStock(symbol, cacheMaxAge = 30) {
  // Implementation
}
```

## Common Issues & Solutions

### Module Not Found

```bash
# Usually means missing npm install
cd server && npm install
cd ../client && npm install
```

### MONGO_URI Error

```bash
# Ensure .env file exists in server/ folder
cd server
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=5001

# Or kill process using 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9
```

## Questions?

- Check existing issues first
- Search documentation
- Ask in GitHub Discussions
- Email maintainer

---

## Appreciation

Thank you for contributing! All contributions, no matter how small, are valued and appreciated. Your improvements help make this project better for everyone! 🙌

---

**Last Updated:** January 2026
