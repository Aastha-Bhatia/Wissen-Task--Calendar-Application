# Calendar App Backend

A robust Express.js backend for a calendar application with holiday integration using the Calendarific API.

## Features

- 🌍 Support for 230+ countries
- 📅 Complete calendar generation with holiday data
- 🎨 Week coloring based on holiday count (1 holiday = light green, 2+ holidays = dark green)
- ⚡ In-memory caching to minimize API calls
- 🛡️ Input validation and error handling
- 🔧 Development tools (cache management, prewarming)
- 📊 API statistics and monitoring

## Project Structure

```
backend/
├── server.js              # Main Express server
├── routes/
│   ├── holidays.js        # Holiday-related endpoints
│   └── countries.js       # Country-related endpoints
├── services/
│   └── holidayService.js  # Calendarific API integration
├── utils/
│   ├── cache.js          # In-memory caching utility
│   └── validator.js      # Input validation helpers
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
└── package.json         # Dependencies and scripts
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get Calendarific API Key

1. Visit [Calendarific.com](https://calendarific.com/)
2. Sign up for a free account
3. Get your API key (1,000 requests/month on free tier)

### 3. Configure Environment

Edit the `.env` file and add your API key:

```env
# Replace with your actual API key
CALENDARIFIC_API_KEY=your_actual_api_key_here

# Other settings can remain as default
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 4. Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Countries
- `GET /api/countries` - Get all supported countries
- `GET /api/countries/popular` - Get popular countries
- `GET /api/countries/search/:query` - Search countries by name/code
- `GET /api/countries/:iso` - Get specific country details

### Holidays
- `GET /api/holidays/:country/:year` - Get all holidays for a country/year
- `GET /api/holidays/:country/:year/:month` - Get holidays for specific month
- `GET /api/holidays/calendar/:country/:year/:month` - Get complete calendar with week coloring

### Development Tools (dev mode only)
- `GET /api/holidays/stats/cache` - View cache statistics
- `DELETE /api/holidays/cache/:key?` - Clear specific cache key or all cache
- `POST /api/holidays/prewarm` - Prewarm cache with popular countries

## API Usage Examples

### Get Calendar Data
```bash
# Get calendar for USA, January 2024
curl "http://localhost:5000/api/holidays/calendar/US/2024/1"
```

Response includes:
- Holiday list for the month
- Complete calendar grid (weeks and days)
- Week coloring information
- Statistics

### Get All Countries
```bash
curl "http://localhost:5000/api/countries"
```

### Search Countries
```bash
# Search for countries containing "united"
curl "http://localhost:5000/api/countries/search/united"
```

## Week Coloring Logic

The calendar applies colors to weeks based on the number of holidays:

- **Default**: No holidays in the week
- **Light Green**: 1 holiday in the week
- **Dark Green**: 2 or more holidays in the week

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Human readable message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Caching

The backend implements intelligent caching:

- **Default TTL**: 1 hour
- **Cache Keys**: Format like `holidays_US_2024_1`
- **Automatic Cleanup**: Expired entries removed every 10 minutes
- **Fallback**: Returns expired cache data if API fails

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |
| `CALENDARIFIC_API_KEY` | Calendarific API key | Required |
| `CALENDARIFIC_BASE_URL` | API base URL | https://calendarific.com/api/v2 |
| `CACHE_DURATION` | Cache TTL in milliseconds | 3600000 (1 hour) |

## Error Handling

The backend includes comprehensive error handling:

- **Validation Errors**: 400 status with detailed error messages
- **API Key Issues**: 503 status (service unavailable)
- **Not Found**: 404 status for missing resources
- **Server Errors**: 500 status with generic message (detailed in dev mode)

## Development Features

In development mode (`NODE_ENV=development`), additional features are available:

1. **Cache Statistics**: View cache performance and memory usage
2. **Cache Management**: Clear specific keys or entire cache
3. **Prewarming**: Load popular countries into cache
4. **Detailed Error Messages**: Full stack traces in responses

## Rate Limiting Considerations

- **Calendarific Free Tier**: 1,000 requests/month
- **Caching Strategy**: Minimizes API calls by caching results for 1 hour
- **Fallback**: Uses expired cache data if API quota exceeded

## Next Steps

This backend is ready to be connected to a frontend. The suggested frontend structure would be:

1. **Country Selector**: Use `/api/countries/popular` endpoint
2. **Month Navigation**: Call `/api/holidays/calendar/:country/:year/:month`
3. **Calendar Display**: Use the week coloring data to style the calendar
4. **Holiday Details**: Show holiday names and descriptions

## Troubleshooting

### Common Issues

1. **"API key not configured"**: Make sure to set `CALENDARIFIC_API_KEY` in `.env`
2. **CORS errors**: Verify `CLIENT_URL` matches your frontend URL
3. **Cache issues**: Clear cache via `/api/holidays/cache` endpoint
4. **Country not found**: Use `/api/countries` to see supported countries

### Logs

The server provides detailed logging:
- Request logging with timestamps
- Cache hit/miss information
- API call tracking
- Error details with context

This backend provides a solid foundation for your calendar app with proper error handling, caching, and development tools!