# Cron Job Setup for Scheduled Triggers

This guide shows how to set up the daily cron job to process scheduled email triggers.

## Option 1: GitHub Actions (Recommended)

Create `.github/workflows/scheduled-triggers.yml`:

```yaml
name: Process Scheduled Email Triggers

on:
  schedule:
    # Runs at 9:00 AM UTC every day
    - cron: '0 9 * * *'
  
  # Allow manual trigger from GitHub UI
  workflow_dispatch:

jobs:
  process-triggers:
    runs-on: ubuntu-latest
    
    steps:
      - name: Process All Scheduled Triggers
        run: |
          RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/make-server-6fcaeea3/scheduled-triggers/process" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "X-Access-Token: ${{ secrets.ADMIN_TOKEN }}" \
            -H "X-Environment-ID: production" \
            -H "Content-Type: application/json")
          
          HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
          BODY=$(echo "$RESPONSE" | head -n-1)
          
          echo "HTTP Status: $HTTP_CODE"
          echo "Response: $BODY"
          
          if [ "$HTTP_CODE" != "200" ]; then
            echo "ERROR: Scheduled trigger processing failed"
            exit 1
          fi
          
          echo "SUCCESS: Scheduled triggers processed"

      - name: Notify on Failure
        if: failure()
        run: |
          echo "Scheduled trigger processing failed! Check the logs."
          # Add your notification logic here (Slack, email, etc.)
```

### Required GitHub Secrets:

Add these secrets to your GitHub repository:

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_ANON_KEY` - Your Supabase anon/public key
3. `ADMIN_TOKEN` - JWT token for an admin user

---

## Option 2: Unix Cron Job

On your server, add this to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 9:00 AM daily)
0 9 * * * curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/scheduled-triggers/process" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Access-Token: YOUR_ADMIN_TOKEN" \
  -H "X-Environment-ID: production" \
  >> /var/log/wecelebrate-triggers.log 2>&1
```

---

## Option 3: Supabase Edge Functions (Cron)

Supabase has built-in cron support. Create a cron function:

```typescript
// supabase/functions/cron-scheduled-triggers/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Verify this is from Supabase Cron
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Call the scheduled triggers endpoint
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-6fcaeea3/scheduled-triggers/process`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'X-Access-Token': req.headers.get('X-Admin-Token') || '',
          'X-Environment-ID': 'production',
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    
    console.log('Scheduled triggers processed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Cron error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

Then configure it in your Supabase dashboard to run daily at 9 AM.

---

## Option 4: Cloud Provider Cron

### AWS EventBridge:

```json
{
  "schedule": "cron(0 9 * * ? *)",
  "target": {
    "url": "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/scheduled-triggers/process",
    "headers": {
      "Authorization": "Bearer YOUR_ANON_KEY",
      "X-Access-Token": "YOUR_ADMIN_TOKEN",
      "X-Environment-ID": "production"
    }
  }
}
```

### Google Cloud Scheduler:

```bash
gcloud scheduler jobs create http process-email-triggers \
  --schedule="0 9 * * *" \
  --uri="https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/scheduled-triggers/process" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_ANON_KEY,X-Access-Token=YOUR_ADMIN_TOKEN,X-Environment-ID=production"
```

### Azure Logic Apps:

Create a recurrence trigger that runs daily at 9 AM and calls your endpoint.

---

## Testing Your Cron Setup

### Manual Test:

```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/scheduled-triggers/process" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "X-Access-Token: YOUR_ADMIN_TOKEN" \
  -H "X-Environment-ID: production" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "selectionExpiring": [...],
  "anniversaryApproaching": [...],
  "totalSent": 15,
  "totalFailed": 0,
  "processedAt": "2026-02-11T09:00:00.000Z"
}
```

### Verify in UI:

1. Go to Admin → Scheduled Triggers Management
2. Check "Execution History" section
3. Verify the latest run shows correct statistics

---

## Monitoring & Alerts

### Check Logs:

View execution logs in the Scheduled Triggers Management UI:
- Last run timestamp
- Emails sent/failed
- Per-site breakdown
- Error messages

### Set Up Alerts:

Monitor these conditions:
- ❌ Cron job didn't run (check last execution timestamp)
- ❌ High failure rate (>10% failed emails)
- ❌ Processing took too long (>60 seconds)
- ❌ HTTP error response from endpoint

### Health Check Endpoint:

Create a monitoring endpoint:

```bash
# Check if last run was within 25 hours
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-6fcaeea3/scheduled-triggers/logs?limit=1"
```

---

## Troubleshooting

### Cron Not Running:

1. Check cron service is active: `systemctl status cron`
2. Verify crontab syntax: `crontab -l`
3. Check cron logs: `grep CRON /var/log/syslog`

### Authentication Errors:

- Verify `SUPABASE_ANON_KEY` is correct
- Verify `ADMIN_TOKEN` is valid and not expired
- Check headers are properly set

### No Emails Sent:

1. Verify automation rules exist and are enabled
2. Check if any employees match the criteria (e.g., expiry in 7 days)
3. Review execution logs for errors
4. Verify email templates are properly configured

### Performance Issues:

- Monitor processing duration in logs
- If >30s, consider optimizing queries
- May need to batch process large sites

---

## Best Practices

1. **Run during off-peak hours** - 9 AM local time is usually good
2. **Monitor daily** - Check execution logs regularly
3. **Alert on failures** - Set up notifications for failed runs
4. **Test in staging first** - Always test with production-like data
5. **Keep logs** - Retain at least 30 days of execution history
6. **Document schedule** - Make sure team knows when cron runs

---

## Time Zone Considerations

The cron runs in UTC by default. Adjust schedule based on your users' time zone:

- **US Eastern (EST/EDT):** `0 14 * * *` (9 AM EST)
- **US Pacific (PST/PDT):** `0 17 * * *` (9 AM PST)
- **UK (GMT/BST):** `0 9 * * *` (9 AM GMT)
- **EU Central (CET/CEST):** `0 8 * * *` (9 AM CET)
- **Asia/Tokyo:** `0 0 * * *` (9 AM JST)

Choose the time zone where most of your employees are located.

---

## Quick Start Checklist

- [ ] Choose cron solution (GitHub Actions recommended)
- [ ] Add required secrets/credentials
- [ ] Configure cron schedule (9 AM daily)
- [ ] Test manually first
- [ ] Verify execution in UI
- [ ] Set up monitoring alerts
- [ ] Document for team
- [ ] Monitor first week closely

---

**Recommended:** Start with GitHub Actions. It's free, reliable, easy to monitor, and has built-in notification options.
