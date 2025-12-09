# 📊 Internal Analytics System Guide

## Overview

Valeris now includes a comprehensive internal analytics system that tracks user behavior, feature usage, and business metrics without requiring external services like Google Analytics. All data is stored securely in your Supabase database.

---

## How It Works

### 1. Event Tracking

The analytics system automatically tracks user events throughout the application:

- **Page Views**: Every page navigation
- **Feature Usage**: Button clicks, feature activations
- **User Actions**: Sign ups, logins, trades created, courses started
- **Errors**: Application errors for debugging

### 2. Data Storage

Events are stored in the `analytics_events` table with:
- User ID (who did it)
- Event name (what happened)
- Event properties (additional context)
- Session ID (groups events together)
- Timestamp (when it happened)

Daily statistics are aggregated in the `analytics_daily_stats` table.

---

## Using Analytics in Your Code

### Basic Event Tracking

```typescript
import { analytics } from '../lib/analytics';

// Track a custom event
analytics.track('button_clicked', {
  button_name: 'upgrade_to_pro',
  location: 'pricing_page'
});

// Track a page view
analytics.pageView('Dashboard');

// Track feature usage
analytics.featureUsed('paper_trading', {
  trades_count: 5
});
```

### Pre-built Event Trackers

```typescript
// User signup
analytics.signUp('email');

// User login
analytics.login('email');

// Trade created
analytics.tradeCreated('journal', {
  symbol: 'AAPL',
  profit: 150
});

// Course started
analytics.courseStarted('course-123', 'Day Trading Basics');

// Course completed
analytics.courseCompleted('course-123', 'Day Trading Basics');

// Subscription event
analytics.subscriptionEvent('upgraded', 'pro');

// Search
analytics.search('TSLA stock', 10, 'watchlist');

// Button click
analytics.buttonClick('upgrade_now', 'pricing_page');

// Error tracking
try {
  // some code
} catch (error) {
  analytics.error(error.message, error.stack);
}
```

### Track Events in Components

```typescript
import { trackEvent } from '../lib/analytics';

function MyComponent() {
  const handleClick = () => {
    // Your code
    trackEvent('feature_activated', {
      feature: 'advanced_charts',
      user_plan: 'pro'
    });
  };

  return <button onClick={handleClick}>Activate</button>;
}
```

---

## Viewing Analytics

### Admin Dashboard

1. Log in as an admin user
2. Click the admin icon (Shield) in the navigation
3. Navigate to the "Internal Analytics" tab

### Available Views

**Key Metrics:**
- Total users
- Active users today
- Total events tracked
- Revenue generated

**Trading Activity:**
- Journal entries created
- Paper trades executed
- Activity trends over time

**Growth Metrics:**
- New user signups
- Daily active users
- Engagement rates

**Popular Events:**
- Most frequently triggered events
- Unique users per event
- Average events per user

**Daily Timeline:**
- Day-by-day breakdown
- User activity patterns
- Revenue tracking

---

## Calculating Daily Stats

Daily statistics are NOT calculated automatically. You must run the calculation function manually or set up a cron job.

### Manual Calculation

In the Admin Dashboard:
1. Go to "Internal Analytics" tab
2. Click "Calculate Today's Stats" button
3. Wait for confirmation

### Via Database Function

Execute this SQL in Supabase SQL Editor:

```sql
-- Calculate stats for today
SELECT calculate_daily_analytics();

-- Calculate stats for specific date
SELECT calculate_daily_analytics('2024-01-15');
```

### Automated Calculation (Recommended)

Set up a cron job to run daily:

**Option 1: Supabase Cron Extension**
```sql
-- Run at midnight every day
SELECT cron.schedule(
  'calculate-daily-analytics',
  '0 0 * * *',
  $$SELECT calculate_daily_analytics()$$
);
```

**Option 2: External Cron (Vercel Cron, etc.)**
Create an Edge Function endpoint that calls the calculation function.

---

## Event Naming Conventions

Use consistent naming for events:

### Format
`category_action`

### Examples
- `user_signup`
- `user_login`
- `trade_created`
- `course_started`
- `course_completed`
- `feature_used`
- `button_clicked`
- `page_view`
- `search_executed`
- `subscription_upgraded`

### Event Properties

Always include relevant context:

```typescript
analytics.track('trade_created', {
  symbol: 'AAPL',
  direction: 'long',
  profit_loss: 150.50,
  trade_type: 'day_trade',
  strategy: 'momentum'
});
```

---

## Privacy & Security

### Data Protection

- Only authenticated users' events are tracked
- IP addresses are anonymized (last octet removed)
- No sensitive data (passwords, API keys) is tracked
- Users can request data deletion (GDPR compliant)

### Row Level Security

- Users can only insert their own events
- Only admins can view analytics data
- All queries are protected by RLS policies

### What We Track

✅ **We DO track:**
- Page views
- Feature usage
- Button clicks
- Trade creation (not trade details)
- Course progress
- Search queries
- Error messages

❌ **We DON'T track:**
- Personal information
- Financial details
- API keys or passwords
- Private messages
- Trade strategies (unless explicitly shared)

---

## Advanced Queries

### Get Popular Events (Last 7 Days)

```sql
SELECT * FROM get_popular_events(7);
```

### Get User Retention

```sql
SELECT * FROM get_user_retention(30);
```

### Custom Event Query

```sql
SELECT
  event_name,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users,
  DATE(created_at) as date
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name, DATE(created_at)
ORDER BY total DESC;
```

### Find Most Active Users

```sql
SELECT
  user_id,
  COUNT(*) as event_count,
  COUNT(DISTINCT event_name) as unique_events
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 10;
```

---

## Performance Tips

### 1. Batch Tracking

If tracking many events, batch them:

```typescript
// Instead of tracking individually
events.forEach(e => analytics.track(e.name, e.props));

// Batch insert
await supabase
  .from('analytics_events')
  .insert(events.map(e => ({
    user_id: userId,
    event_name: e.name,
    event_properties: e.props,
    session_id: sessionId
  })));
```

### 2. Async Tracking

Don't wait for tracking to complete:

```typescript
// Fire and forget
analytics.track('button_clicked', { button: 'save' });
// Continue with your code immediately
```

### 3. Indexes

The following indexes are created automatically:
- `user_id` - Fast user lookups
- `event_name` - Fast event aggregation
- `created_at` - Fast time-based queries

---

## Troubleshooting

### Events Not Appearing

1. **Check user is logged in**: Anonymous users' events aren't tracked
2. **Check console for errors**: Look for "Analytics tracking error"
3. **Verify RLS policies**: Ensure policies allow insertion
4. **Check Supabase connection**: Verify VITE_SUPABASE_URL is correct

### Daily Stats Not Updating

1. **Run calculation manually**: Click "Calculate Today's Stats"
2. **Check for data**: Ensure there are events to aggregate
3. **Check database function**: Verify `calculate_daily_analytics` exists
4. **Look for errors**: Check Supabase logs

### Performance Issues

1. **Too many events**: Consider sampling (track 1 in 10)
2. **Large event properties**: Keep properties small
3. **Missing indexes**: Check indexes are created
4. **Old data**: Archive or delete old analytics data

---

## Data Retention

### Recommended Policy

- **Recent data (0-90 days)**: Keep all events
- **Historical data (90-365 days)**: Keep daily aggregates only
- **Old data (1+ years)**: Archive or delete

### Archive Old Events

```sql
-- Archive events older than 90 days
INSERT INTO analytics_events_archive
SELECT * FROM analytics_events
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete archived events
DELETE FROM analytics_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Export Analytics Data

### From Admin Dashboard

1. Go to "Internal Analytics" tab
2. Select time range
3. Click "Export Data" (if implemented)

### Via SQL

```sql
-- Export to CSV
COPY (
  SELECT * FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
) TO '/tmp/analytics_export.csv' CSV HEADER;
```

---

## Future Enhancements

Planned features:
- Real-time dashboard updates
- Custom event funnels
- User cohort analysis
- A/B testing framework
- Automated reports via email
- Mobile app analytics
- Heat maps and session recordings

---

## Best Practices

### 1. Track What Matters

Focus on events that help you make decisions:
- **User engagement**: What features are used most?
- **Conversion funnels**: Where do users drop off?
- **Retention**: What keeps users coming back?
- **Revenue**: What drives subscriptions?

### 2. Consistent Naming

Use the same naming convention everywhere:
- `user_*` - User-related events
- `trade_*` - Trading-related events
- `course_*` - Education-related events
- `subscription_*` - Payment-related events

### 3. Meaningful Properties

Include context that helps analysis:
```typescript
// ❌ Not helpful
analytics.track('action');

// ✅ Helpful
analytics.track('trade_created', {
  symbol: 'AAPL',
  profit_loss: 150,
  strategy: 'momentum',
  session_length: 45
});
```

### 4. Test Your Tracking

Always verify events are being tracked:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Analytics event:', eventName, properties);
}
```

---

## Support

Need help with analytics?
- Check Supabase logs for errors
- Review this guide for common issues
- Contact support with specific questions
- Join community forum for tips

---

**Happy Tracking! 📊**
