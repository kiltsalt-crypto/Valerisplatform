import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CoachRequest {
  message: string;
  context?: {
    recentTrades?: any[];
    performance?: any;
    currentGoals?: string[];
  };
  analysisType?: 'pattern' | 'risk' | 'performance' | 'education' | 'strategy';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, analysisType }: CoachRequest = await req.json();

    // Get user's trading history for context
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user's progress data
    const { data: progress } = await supabase
      .from('ai_coach_progress')
      .select('*')
      .eq('user_id', user.id);

    // Get recent conversations for context
    const { data: recentConversations } = await supabase
      .from('ai_coach_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent market news for context
    const { data: marketNews } = await supabase
      .from('market_news')
      .select('*')
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(5);

    // Get upcoming economic events
    const { data: economicEvents } = await supabase
      .from('economic_events')
      .select('*')
      .gte('event_datetime', new Date().toISOString())
      .order('event_datetime', { ascending: true })
      .limit(3);

    // Get market sentiment for user's preferred instruments
    const { data: marketSentiment } = await supabase
      .from('market_sentiment')
      .select('*')
      .gte('sentiment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('sentiment_date', { ascending: false })
      .limit(10);

    // Build context for AI
    const conversationHistory = recentConversations?.map(c => ({
      role: c.role,
      content: c.message
    })) || [];

    // Create AI coaching prompt with market context
    const marketContext = `
Recent Market News:
${marketNews?.map(n => `- ${n.title} (${n.sentiment}, ${n.impact_level} impact)`).join('\n') || 'No recent news'}

Upcoming Economic Events:
${economicEvents?.map(e => `- ${e.event_name} on ${new Date(e.event_datetime).toLocaleString()} (${e.importance} importance)`).join('\n') || 'No upcoming events'}

Market Sentiment:
${marketSentiment?.map(s => `- ${s.instrument}: ${s.sentiment_score > 0 ? 'Bullish' : 'Bearish'} (${s.sentiment_score})`).join('\n') || 'No sentiment data'}
`;

    const systemPrompt = `You are an expert trading coach specializing in futures and options trading. Your role is to:

1. Analyze trading patterns and identify strengths/weaknesses
2. Provide personalized education based on the trader's level
3. Suggest improvements to trading strategy
4. Help with risk management and psychology
5. Track progress and celebrate milestones
6. Provide market context and how it may affect trading

User Context:
- Total Trades: ${trades?.length || 0}
- Recent Performance: ${context?.performance ? JSON.stringify(context.performance) : 'Not available'}
- Current Goals: ${context?.currentGoals?.join(', ') || 'Not specified'}
- Progress Areas: ${progress?.map(p => `${p.skill_area}: ${p.progress_score}%`).join(', ') || 'Starting journey'}

${marketContext}

Be encouraging, specific, and actionable. Use trading terminology appropriately but explain complex concepts clearly. Consider market conditions when providing advice.`;

    const userMessage = analysisType 
      ? `Analyze my ${analysisType}: ${message}\n\nRecent trades: ${JSON.stringify(trades?.slice(0, 5))}`
      : message;

    // Simulate AI response (In production, this would call OpenAI/Claude API)
    // For now, we'll provide intelligent rule-based responses with market context
    const aiResponse = generateCoachResponse(message, analysisType, trades, progress, marketNews, economicEvents);

    // Save conversation
    await supabase.from('ai_coach_conversations').insert([
      { user_id: user.id, message, role: 'user', context_data: context || {} },
      { user_id: user.id, message: aiResponse.message, role: 'assistant', context_data: aiResponse.analysis || {} }
    ]);

    // Save analysis if it's an analysis request
    if (analysisType && aiResponse.analysis) {
      await supabase.from('ai_coach_analysis').insert({
        user_id: user.id,
        analysis_type: analysisType,
        analysis_data: aiResponse.analysis,
        recommendations: aiResponse.recommendations || []
      });
    }

    // Update progress if applicable
    if (aiResponse.progressUpdate) {
      await supabase.from('ai_coach_progress')
        .upsert({
          user_id: user.id,
          skill_area: aiResponse.progressUpdate.skill_area,
          progress_score: aiResponse.progressUpdate.score,
          milestones: aiResponse.progressUpdate.milestones,
          strengths: aiResponse.progressUpdate.strengths,
          areas_to_improve: aiResponse.progressUpdate.areas_to_improve,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,skill_area' });
    }

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Coach Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCoachResponse(message: string, analysisType: string | undefined, trades: any[] | null, progress: any[] | null, marketNews: any[] | null, economicEvents: any[] | null) {
  const lowerMessage = message.toLowerCase();

  // Market context awareness
  const hasHighImpactNews = marketNews?.some(n => n.impact_level === 'high' || n.impact_level === 'critical');
  const upcomingEvents = economicEvents?.filter(e => new Date(e.event_datetime).getTime() - Date.now() < 24 * 60 * 60 * 1000);
  const marketWarning = hasHighImpactNews || (upcomingEvents && upcomingEvents.length > 0)
    ? `\n\n⚠️ **Market Alert**: ${hasHighImpactNews ? 'High-impact news is affecting markets.' : ''} ${upcomingEvents && upcomingEvents.length > 0 ? `${upcomingEvents.length} important economic event(s) coming up in the next 24 hours.` : ''} Consider adjusting position sizes and risk management.`
    : '';
  
  // Pattern Analysis
  if (analysisType === 'pattern' || lowerMessage.includes('pattern')) {
    const winningTrades = trades?.filter(t => t.pnl > 0).length || 0;
    const losingTrades = trades?.filter(t => t.pnl < 0).length || 0;
    const winRate = trades?.length ? (winningTrades / trades.length * 100).toFixed(1) : 0;
    
    return {
      message: `I've analyzed your trading patterns! Here's what I found:\n\n📊 **Pattern Analysis:**\n- Win Rate: ${winRate}%\n- Winning Trades: ${winningTrades}\n- Losing Trades: ${losingTrades}\n\n🎯 **Key Observations:**\n${winRate > 50 ? '✅ Great win rate! You\'re showing consistency.' : '⚠️ Win rate needs improvement. Let\'s work on entry timing.'}\n\n💡 **Recommendations:**\n1. ${winRate > 50 ? 'Focus on increasing position size on high-confidence setups' : 'Review losing trades to identify common mistakes'}\n2. Track your emotional state before each trade\n3. Set stricter entry criteria to improve quality${marketWarning}\n\nWould you like me to dive deeper into any specific aspect?`,
      analysis: { winRate, winningTrades, losingTrades, totalTrades: trades?.length || 0 },
      recommendations: [
        'Review trade journal entries for patterns',
        'Focus on risk management',
        'Consider smaller position sizes while building consistency'
      ]
    };
  }
  
  // Risk Analysis
  if (analysisType === 'risk' || lowerMessage.includes('risk')) {
    const avgRisk = trades?.length ? trades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / trades.length : 0;
    
    return {
      message: `Let's review your risk management! 🛡️\n\n**Risk Profile:**\n- Average Risk per Trade: $${avgRisk.toFixed(2)}\n- Total Trades Analyzed: ${trades?.length || 0}\n\n**Risk Assessment:**\n${avgRisk > 100 ? '⚠️ You\'re risking significant amounts per trade. Consider reducing position sizes.' : '✅ Your risk per trade looks reasonable!'}\n\n**Best Practices:**\n1. Never risk more than 1-2% of your account per trade\n2. Use stop losses on every position\n3. Position size based on your risk tolerance\n4. Diversify across different instruments\n\nRemember: Protecting capital is more important than making money!`,
      analysis: { avgRisk, totalTrades: trades?.length || 0 },
      recommendations: [
        'Calculate position size before entering trades',
        'Set stop losses at logical technical levels',
        'Keep a risk journal'
      ]
    };
  }
  
  // Performance Review
  if (analysisType === 'performance' || lowerMessage.includes('performance')) {
    const totalPnL = trades?.reduce((sum, t) => sum + t.pnl, 0) || 0;
    const bestTrade = trades?.reduce((max, t) => t.pnl > max ? t.pnl : max, 0) || 0;
    const worstTrade = trades?.reduce((min, t) => t.pnl < min ? t.pnl : min, 0) || 0;
    
    return {
      message: `Here's your performance snapshot! 📈\n\n**Overall Performance:**\n- Total P&L: $${totalPnL.toFixed(2)}\n- Best Trade: $${bestTrade.toFixed(2)}\n- Worst Trade: $${worstTrade.toFixed(2)}\n\n**Performance Insights:**\n${totalPnL > 0 ? '🎉 You\'re profitable! Keep doing what works.' : '📚 Learning phase - every trade is a lesson.'}\n\n**Growth Areas:**\n1. ${totalPnL > 0 ? 'Scale winners and cut losers faster' : 'Focus on win rate improvement'}\n2. Maintain detailed trade notes\n3. Review winning trades to replicate success\n\nYour journey to mastery is progressing! Keep learning and adapting.`,
      analysis: { totalPnL, bestTrade, worstTrade, tradeCount: trades?.length || 0 },
      progressUpdate: {
        skill_area: 'overall_trading',
        score: Math.min(100, Math.max(0, 50 + (totalPnL / 100))),
        milestones: totalPnL > 0 ? ['First Profitable Period'] : [],
        strengths: totalPnL > 0 ? ['Positive P&L'] : ['Commitment to learning'],
        areas_to_improve: totalPnL < 0 ? ['Risk Management', 'Entry Timing'] : ['Position Sizing']
      }
    };
  }
  
  // Educational Content
  if (analysisType === 'education' || lowerMessage.includes('learn') || lowerMessage.includes('teach')) {
    return {
      message: `Let's level up your trading knowledge! 📚\n\n**Key Trading Concepts:**\n\n1️⃣ **Risk Management**\n- Always define your risk before entering\n- Use the 1% rule: Never risk more than 1% per trade\n\n2️⃣ **Technical Analysis**\n- Support and resistance levels\n- Trend identification\n- Chart patterns and indicators\n\n3️⃣ **Trading Psychology**\n- Emotional discipline\n- Avoiding revenge trading\n- Staying patient for setups\n\n4️⃣ **Strategy Development**\n- Define clear entry/exit rules\n- Backtest your strategy\n- Keep a trading journal\n\nWhat specific topic would you like to explore deeper?`,
      recommendations: [
        'Complete the Risk Management module',
        'Practice with paper trading',
        'Study chart patterns daily'
      ]
    };
  }
  
  // General conversation
  return {
    message: `Hey! I'm here to help you become a better trader. 🚀\n\nI can assist you with:\n\n📊 **Pattern Analysis** - Identify your trading patterns\n🛡️ **Risk Management** - Optimize your risk strategy\n📈 **Performance Review** - Track your progress\n📚 **Education** - Learn new concepts\n💡 **Strategy Tips** - Improve your approach\n\nWhat would you like to work on today? Just ask me anything about trading, and I'll provide personalized guidance based on your history and goals!`,
    recommendations: [
      'Start with a performance analysis',
      'Review your risk management approach',
      'Set clear trading goals'
    ]
  };
}
