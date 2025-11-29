"""
Automatic Insight Generator for Marketing Diagnostics
Generates executive summaries from analytics data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Dict, Any, List


class InsightGeneratorService:
    """Generate automatic insights from analytics data"""
    
    @staticmethod
    def generate_social_media_insights(analytics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate automatic insights for social media analytics
        Returns: Top 5 insights, Push/Fix/Drop, Strategic recommendations, 
                 Persona alignment, Priority actions
        """
        if not analytics or 'overview' not in analytics:
            return {'error': 'No analytics data available'}
        
        insights = {
            'top_insights': [],
            'push_fix_drop': analytics.get('push_fix_drop', {'push': [], 'fix': [], 'drop': []}),
            'strategic_recommendations': [],
            'persona_alignment': '',
            'priority_actions': []
        }
        
        # Overview metrics
        overview = analytics.get('overview', {})
        total_posts = overview.get('total_posts', 0)
        avg_engagement_rate = overview.get('avg_engagement_rate', 0)
        
        # Platform Performance Insights
        platforms = analytics.get('platform_comparison', [])
        if platforms:
            # Find best performing platform
            best_platform = max(platforms, key=lambda x: x.get('avg_engagement_rate', 0))
            insights['top_insights'].append(
                f"{best_platform['platform']} drives the highest engagement rate at {round(best_platform['avg_engagement_rate'] * 100, 2)}% across {best_platform['posting_frequency']} posts."
            )
            
            # Find platform with most views
            views_leader = max(platforms, key=lambda x: x.get('avg_views', 0))
            if views_leader['platform'] != best_platform['platform']:
                insights['top_insights'].append(
                    f"{views_leader['platform']} drives the highest reach with {int(views_leader['avg_views'])} average views per post."
                )
        
        # Content Pillar Performance
        pillars = analytics.get('content_pillars', [])
        if pillars and len(pillars) >= 2:
            best_pillar = pillars[0]  # Already sorted descending
            worst_pillar = pillars[-1]
            
            ratio = best_pillar['avg_engagement_rate'] / max(worst_pillar['avg_engagement_rate'], 0.0001)
            insights['top_insights'].append(
                f"{best_pillar['pillar']} content generates {ratio:.1f}× higher engagement ({round(best_pillar['avg_engagement_rate'] * 100, 2)}%) than {worst_pillar['pillar']} posts ({round(worst_pillar['avg_engagement_rate'] * 100, 2)}%)."
            )
        \n        # Sentiment Analysis Insights\n        sentiment_data = analytics.get('sentiment_heatmap', [])\n        if sentiment_data:\n            sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}\n            for item in sentiment_data:\n                sent = str(item.get('sentiment', '')).lower()\n                if 'pos' in sent:\n                    sentiment_counts['positive'] += item.get('count', 0)\n                elif 'neg' in sent:\n                    sentiment_counts['negative'] += item.get('count', 0)\n                else:\n                    sentiment_counts['neutral'] += item.get('count', 0)\n            \n            total_sentiment = sum(sentiment_counts.values())\n            if total_sentiment > 0:\n                positive_rate = (sentiment_counts['positive'] / total_sentiment) * 100\n                negative_rate = (sentiment_counts['negative'] / total_sentiment) * 100\n                \n                if positive_rate > 60:\n                    insights['top_insights'].append(\n                        f\"Strong positive sentiment ({positive_rate:.0f}%) indicates high audience satisfaction and content resonance.\"\n                    )\n                elif negative_rate > 30:\n                    insights['top_insights'].append(\n                        f\"Elevated negative sentiment ({negative_rate:.0f}%) signals need for content strategy review.\"\n                    )\n        \n        # Engagement Rate Insights\n        if avg_engagement_rate > 0.05:  # 5%\n            insights['top_insights'].append(\n                f\"Exceptional engagement rate of {round(avg_engagement_rate * 100, 2)}% indicates strong content-market fit.\"\n            )\n        elif avg_engagement_rate < 0.02:  # 2%\n            insights['top_insights'].append(\n                f\"Engagement rate of {round(avg_engagement_rate * 100, 2)}% below industry average - optimization needed.\"\n            )\n        \n        # Limit to top 5 insights\n        insights['top_insights'] = insights['top_insights'][:5]\n        \n        # STRATEGIC RECOMMENDATIONS\n        push_count = len(insights['push_fix_drop']['push'])\n        fix_count = len(insights['push_fix_drop']['fix'])\n        drop_count = len(insights['push_fix_drop']['drop'])\n        \n        if push_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Scale production of {', '.join([p['type'] for p in insights['push_fix_drop']['push'][:2]])} content\",\n                'expected_impact': 'Maximize engagement and audience growth'\n            })\n        \n        if fix_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Improve messaging for {', '.join([f['type'] for f in insights['push_fix_drop']['fix'][:2]])} to address negative sentiment\",\n                'expected_impact': 'Convert engagement into positive brand perception'\n            })\n        \n        if drop_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'Medium',\n                'action': f\"Reduce or restructure {', '.join([d['type'] for d in insights['push_fix_drop']['drop'][:2]])} content\",\n                'expected_impact': 'Reallocate resources to high-performing content'\n            })\n        \n        insights['strategic_recommendations'].append({\n            'priority': 'Medium',\n            'action': 'A/B test new content formats within top-performing pillars',\n            'expected_impact': 'Discover optimization opportunities'\n        })\n        \n        # PERSONA ALIGNMENT\n        if avg_engagement_rate > 0.03:\n            insights['persona_alignment'] = f\"Content resonates strongly with target audience (avg {round(avg_engagement_rate * 100, 2)}% engagement). Continue current persona targeting with focus on {best_pillar['pillar'] if pillars else 'top content types'}.\"\n        else:\n            insights['persona_alignment'] = f\"Engagement below target ({round(avg_engagement_rate * 100, 2)}%). Review persona assumptions and test content variations to better match audience preferences.\"\n        \n        # PRIORITY ACTIONS\n        insights['priority_actions'] = [\n            {'action': f\"Increase posting frequency for {pillars[0]['pillar']} content\" if pillars else \"Focus on top-performing content types\", 'priority': 1},\n            {'action': 'Analyze sentiment patterns to identify messaging improvements', 'priority': 2},\n            {'action': f\"Test new formats on {best_platform['platform']} platform\" if platforms else \"Optimize platform strategy\", 'priority': 3},\n            {'action': 'Review underperforming content for insights on what to avoid', 'priority': 4},\n            {'action': 'Set up engagement tracking dashboard for real-time monitoring', 'priority': 5}\n        ]
        
        return insights
    
    @staticmethod
    def generate_search_marketing_insights(analytics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate automatic insights for search marketing analytics
        Returns: Top insights, keyword opportunities, strategic recommendations,
                 content gaps, priority actions
        """
        if not analytics or 'overview' not in analytics:
            return {'error': 'No analytics data available'}
        
        insights = {
            'top_insights': [],
            'keyword_opportunities': [],
            'content_gaps': analytics.get('content_gaps', []),
            'strategic_recommendations': [],
            'priority_actions': []
        }
        
        overview = analytics.get('overview', {})
        total_keywords = overview.get('total_keywords', 0)
        total_volume = overview.get('total_search_volume', 0)
        avg_difficulty = overview.get('avg_keyword_difficulty', 0)
        
        # TOP INSIGHTS
        top_keywords = analytics.get('top_keywords', [])
        if top_keywords and len(top_keywords) > 0:
            top_kw = top_keywords[0]
            insights['top_insights'].append(
                f\"Highest opportunity keyword: '{top_kw['keyword']}' ({top_kw['volume']:,} monthly searches, difficulty {top_kw['difficulty']}, score {top_kw['opportunity_score']})\"\n            )\n        \n        # Intent distribution\n        intent_data = analytics.get('intent_funnel', [])\n        if intent_data:\n            # Find dominant intent\n            dominant_intent = max(intent_data, key=lambda x: x['count'])\n            insights['top_insights'].append(\n                f\"{dominant_intent['intent']} intent dominates with {dominant_intent['count']} keywords ({dominant_intent['total_volume']:,} total volume)\"\n            )\n            \n            # Check for purchase intent\n            purchase_data = [i for i in intent_data if i['intent'].lower() == 'purchase']\n            if purchase_data and len(purchase_data) > 0:\n                purchase = purchase_data[0]\n                if purchase['count'] > total_keywords * 0.15:\n                    insights['top_insights'].append(\n                        f\"Strong purchase intent presence ({purchase['count']} keywords) indicates high conversion potential\"\n                    )\n        \n        # Difficulty distribution\n        difficulty_dist = analytics.get('difficulty_distribution', {})\n        easy_count = difficulty_dist.get('Easy (0-30)', 0)\n        if easy_count > total_keywords * 0.2:\n            insights['top_insights'].append(\n                f\"Quick-win opportunity: {easy_count} low-difficulty keywords available ({int(easy_count/total_keywords*100)}% of portfolio)\"\n            )\n        \n        # Content gaps\n        content_gaps = analytics.get('content_gaps', [])\n        if len(content_gaps) > 0:\n            gap_volume = sum(g.get('volume', 0) for g in content_gaps[:10])\n            insights['top_insights'].append(\n                f\"Content gap analysis reveals {len(content_gaps)} keywords where competitors rank but you don't (top 10 = {gap_volume:,} volume)\"\n            )\n        \n        # Limit to top 5\n        insights['top_insights'] = insights['top_insights'][:5]\n        \n        # KEYWORD OPPORTUNITIES (from top_keywords)\n        insights['keyword_opportunities'] = top_keywords[:10]  # Already includes content suggestions\n        \n        # STRATEGIC RECOMMENDATIONS\n        if easy_count >= 3:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Launch quick-win campaign targeting {easy_count} easy-to-rank keywords\",\n                'expected_impact': 'Fast rankings within 3-6 months'\n            })\n        \n        if len(content_gaps) > 5:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Fill top {min(len(content_gaps), 10)} content gaps where competitors dominate\",\n                'expected_impact': 'Capture competitor traffic'\n            })\n        \n        # Intent-based recommendations\n        if intent_data:\n            for intent_item in intent_data:\n                intent_name = intent_item['intent']\n                if intent_name.lower() == 'purchase' and intent_item['count'] > 0:\n                    insights['strategic_recommendations'].append({\n                        'priority': 'High',\n                        'action': f\"Optimize product pages for {intent_item['count']} purchase-intent keywords\",\n                        'expected_impact': 'Direct revenue impact'\n                    })\n                    break\n        \n        insights['strategic_recommendations'].append({\n            'priority': 'Medium',\n            'action': 'Build content clusters around top opportunity themes',\n            'expected_impact': 'Establish topical authority'\n        })\n        \n        insights['strategic_recommendations'].append({\n            'priority': 'Medium',\n            'action': 'Monitor competitor keyword movements monthly',\n            'expected_impact': 'Stay ahead of market shifts'\n        })\n        \n        # PRIORITY ACTIONS\n        if len(top_keywords) > 0:\n            insights['priority_actions'] = [\n                {'action': f\"Create content for '{top_keywords[0]['keyword']}'\" if len(top_keywords) > 0 else \"Target top opportunity keyword\", 'priority': 1},\n                {'action': f\"Fill top 3 content gaps: {', '.join([g['keyword'] for g in content_gaps[:3]])}\" if len(content_gaps) >= 3 else \"Address content gaps\", 'priority': 2},\n                {'action': 'Optimize existing pages for medium-difficulty keywords', 'priority': 3},\n                {'action': 'Build backlink strategy for high-difficulty targets', 'priority': 4},\n                {'action': 'Set up rank tracking for top 20 opportunity keywords', 'priority': 5}\n            ]\n        else:\n            insights['priority_actions'] = [\n                {'action': 'Conduct keyword research to identify opportunities', 'priority': 1},\n                {'action': 'Audit existing content for optimization potential', 'priority': 2},\n                {'action': 'Analyze competitor keyword strategies', 'priority': 3}\n            ]
        
        return insights
