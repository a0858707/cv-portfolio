const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static assets with proper caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Railway & Cloudflare Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Alexander Bogolepov Portfolio & CV'
  });
});

// Interactive AI Agent n8n Error Simulation Endpoint
app.post('/api/simulate-agent', (req, res) => {
  const { scenario } = req.body || {};

  const scenarios = {
    'rate_limit': {
      title: 'WhatsApp Business API (429 Too Many Requests)',
      workflow: 'Marketing Broadcast Pipeline #042',
      error: 'HTTP 429: Rate limit exceeded. 120 req/sec quota reached during flash-sale launch.',
      rootCause: 'Sudden influx of 14,000 CRM lead webhooks exceeded provider burst tier.',
      aiDiagnosis: 'Transient concurrency spike. No schema mismatch or fatal auth failure detected.',
      actionTaken: [
        'AI Agent automatically paused downstream worker node',
        'Diverted incoming payload batch to Redis Priority Queue with Jitter backoff (base 1.8s)',
        'Adjusted burst pacing from 120 req/s to 45 req/s dynamically',
        'Resumed queue processing without losing a single lead payload'
      ],
      leadsAffected: 382,
      leadsRecovered: 382,
      recoveryStatus: 'RESOLVED_AUTOMATICALLY',
      latency: '240ms'
    },
    'token_expired': {
      title: 'Meta Conversions API OAuth Token Revocation',
      workflow: 'Attribution & CAPI Sync Worker #108',
      error: 'OAuthException: Error validating access token: Session has expired on 2026-11-20.',
      rootCause: 'Long-lived System User token expired after 60-day security rotation policy.',
      aiDiagnosis: 'Authentication failure. Retrying without token renewal will fail and burn compute.',
      actionTaken: [
        'AI Agent intercepted failed CAPI webhook before data was dropped',
        'Buffered 89 conversion events in local PostgreSQL staging table with FBP/FBC preserved',
        'Triggered automated OAuth refresh workflow via Vault secret manager',
        'Dispatched High-Priority Mattermost alert to RevOps channel with 1-click token re-auth link'
      ],
      leadsAffected: 89,
      leadsRecovered: 89,
      recoveryStatus: 'BUFFERED_AND_ALERTED',
      latency: '310ms'
    },
    'schema_drift': {
      title: 'CRM Webhook Payload Schema Drift',
      workflow: 'Lead-to-Deal Routing & Enrichment #017',
      error: 'TypeError: Cannot read property "custom_fields_values" of undefined in Code Node #3.',
      rootCause: 'Sales Ops renamed custom field "UTM Campaign ID" to "Campaign ID v2" in CRM settings.',
      aiDiagnosis: 'Schema divergence detected. Downstream JavaScript node expects legacy key structure.',
      actionTaken: [
        'AI Agent inspected JSON payload diff against last 1,000 valid executions',
        'Identified missing key "custom_fields_values[184920]" mapped to new field ID "192341"',
        'Generated hot-patch JavaScript snippet for n8n Code node automatically',
        'Sent pull request alert to Mattermost with ready-to-paste fallback regex expression'
      ],
      leadsAffected: 45,
      leadsRecovered: 45,
      recoveryStatus: 'PATCH_GENERATED_LEADS_QUEUED',
      latency: '450ms'
    },
    'rate_limiter_overflow': {
      title: 'Custom Rate Limiter Gateway: RabbitMQ Outgrown & Replaced',
      workflow: 'High-Concurrency Webhook Dispatcher #001',
      error: 'RabbitMQ Backpressure Bottleneck: Unable to handle asymmetric rate limits (CRM 7 req/s vs WABA 40 req/s).',
      rootCause: 'Standard broker queues suffered head-of-line blocking during a 22,000 lead marketing launch.',
      aiDiagnosis: 'Asymmetric downstream consumer saturation. RabbitMQ lacked per-destination token bucket precision.',
      actionTaken: [
        'Custom Rate Limiter Gateway intercepted webhook stream directly from n8n',
        'Separated payloads into isolated dynamic sliding-window queues per destination',
        'Strictly paced CRM API v4 to 6.8 req/s while accelerating WhatsApp WABA to 40 req/s',
        'Successfully dispatched 22,000 webhooks with 0 dropped events and 0 HTTP 429 lockouts'
      ],
      leadsAffected: 22000,
      leadsRecovered: 22000,
      recoveryStatus: '100%_DISPATCHED_ZERO_DROPS',
      latency: '180ms'
    }
  };

  const result = scenarios[scenario] || scenarios['rate_limit'];
  res.json({
    success: true,
    data: result
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alexander Bogolepov CV & Portfolio server running on port ${PORT}`);
});
