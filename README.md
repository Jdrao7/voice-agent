# PersonaVoice AI - Staff Dashboard

AI Voice Agent for Phone Calls with Real-Time Staff Dashboard.

## Architecture

```
Customer calls → VAPI Phone Number → AI handles call → Webhook → Database → Staff Dashboard
                                                                              ↓
                                                              View calls, make orders, handle escalations
```

## How It Works

1. **Customer calls your VAPI phone number** (configured in VAPI dashboard)
2. **AI Agent answers and handles the call** (VAPI manages STT/LLM/TTS)
3. **Webhook receives call events** at `/api/vapi`
4. **Call data saved to database** (transcripts, intents, status)
5. **Staff views real-time dashboard** to make orders and handle escalations

## Setup

### 1. VAPI Configuration

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Create an Assistant with your desired voice and prompt
3. Get a phone number (or bring your own via Twilio)
4. Set webhook URL to: `https://your-domain.com/api/vapi`

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_xxxxx
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PRIVATE_KEY=your_private_key

# Database (optional - using mock data for demo)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Redirects to Staff Dashboard

## Features

### Staff Dashboard
- **Real-time call list** - Auto-refreshes every 5 seconds
- **Filter by status** - All, New, Escalated, Handled, Order Made
- **Full transcripts** - See complete conversation history
- **AI summaries** - Quick overview of each call
- **One-click actions** - Create Order, Mark Handled

### Guardrails (Agent 2)
- Forbidden topics (legal advice, competitor info, etc.)
- Escalation triggers (manager requests, angry customers)
- Auto-handoff with context

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vapi` | POST | VAPI webhook - receives call events |
| `/api/calls` | GET | List all calls |
| `/api/orders` | POST | Create order from call |
| `/api/handoffs` | GET | Get escalation context |

## Database Schema (Supabase)

```sql
-- Run in Supabase SQL editor
CREATE TABLE calls (
  id UUID PRIMARY KEY,
  phone_number TEXT,
  transcript JSONB DEFAULT '[]',
  summary TEXT,
  intent TEXT,
  status TEXT DEFAULT 'new',
  needs_human BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id),
  order_details JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id),
  context TEXT,
  customer_sentiment TEXT,
  reason TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Deploy

1. Deploy to Vercel: `vercel`
2. Set environment variables in Vercel dashboard
3. Update VAPI webhook URL to your production domain
4. Configure phone number in VAPI

## License

MIT
