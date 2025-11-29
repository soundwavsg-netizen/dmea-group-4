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
            
            ratio = best_pillar['avg_engagement_rate'] / max(worst_pillar['avg_engagement_rate'], 0.0001)\n            insights['top_insights'].append(\n                f\"{best_pillar['pillar']} content generates {ratio:.1f}× higher engagement ({round(best_pillar['avg_engagement_rate'] * 100, 2)}%) than {worst_pillar['pillar']} posts ({round(worst_pillar['avg_engagement_rate'] * 100, 2)}%).\"\n            )\n        \n        # Sentiment Analysis Insights\n        sentiment_data = analytics.get('sentiment_heatmap', [])\n        if sentiment_data:\n            sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}\n            for item in sentiment_data:\n                sent = str(item.get('sentiment', '')).lower()\n                if 'pos' in sent:\n                    sentiment_counts['positive'] += item.get('count', 0)\n                elif 'neg' in sent:\n                    sentiment_counts['negative'] += item.get('count', 0)\n                else:\n                    sentiment_counts['neutral'] += item.get('count', 0)\n            \n            total_sentiment = sum(sentiment_counts.values())\n            if total_sentiment > 0:\n                positive_rate = (sentiment_counts['positive'] / total_sentiment) * 100\n                negative_rate = (sentiment_counts['negative'] / total_sentiment) * 100\n                \n                if positive_rate > 60:\n                    insights['top_insights'].append(\n                        f\"Strong positive sentiment ({positive_rate:.0f}%) indicates high audience satisfaction and content resonance.\"\n                    )\n                elif negative_rate > 30:\n                    insights['top_insights'].append(\n                        f\"Elevated negative sentiment ({negative_rate:.0f}%) signals need for content strategy review.\"\n                    )\n        \n        # Engagement Rate Insights\n        if avg_engagement_rate > 0.05:  # 5%\n            insights['top_insights'].append(\n                f\"Exceptional engagement rate of {round(avg_engagement_rate * 100, 2)}% indicates strong content-market fit.\"\n            )\n        elif avg_engagement_rate < 0.02:  # 2%\n            insights['top_insights'].append(\n                f\"Engagement rate of {round(avg_engagement_rate * 100, 2)}% below industry average - optimization needed.\"\n            )\n        \n        # Limit to top 5 insights\n        insights['top_insights'] = insights['top_insights'][:5]\n        \n        # STRATEGIC RECOMMENDATIONS\n        push_count = len(insights['push_fix_drop']['push'])\n        fix_count = len(insights['push_fix_drop']['fix'])\n        drop_count = len(insights['push_fix_drop']['drop'])\n        \n        if push_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Scale production of {', '.join([p['type'] for p in insights['push_fix_drop']['push'][:2]])} content\",\n                'expected_impact': 'Maximize engagement and audience growth'\n            })\n        \n        if fix_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'High',\n                'action': f\"Improve messaging for {', '.join([f['type'] for f in insights['push_fix_drop']['fix'][:2]])} to address negative sentiment\",\n                'expected_impact': 'Convert engagement into positive brand perception'\n            })\n        \n        if drop_count > 0:\n            insights['strategic_recommendations'].append({\n                'priority': 'Medium',\n                'action': f\"Reduce or restructure {', '.join([d['type'] for d in insights['push_fix_drop']['drop'][:2]])} content\",\n                'expected_impact': 'Reallocate resources to high-performing content'\n            })\n        \n        insights['strategic_recommendations'].append({\n            'priority': 'Medium',\n            'action': 'A/B test new content formats within top-performing pillars',\n            'expected_impact': 'Discover optimization opportunities'\n        })\n        \n        # PERSONA ALIGNMENT\n        if avg_engagement_rate > 0.03:\n            insights['persona_alignment'] = f\"Content resonates strongly with target audience (avg {round(avg_engagement_rate * 100, 2)}% engagement). Continue current persona targeting with focus on {best_pillar['pillar'] if pillars else 'top content types'}.\"\n        else:\n            insights['persona_alignment'] = f\"Engagement below target ({round(avg_engagement_rate * 100, 2)}%). Review persona assumptions and test content variations to better match audience preferences.\"\n        \n        # PRIORITY ACTIONS\n        insights['priority_actions'] = [\n            {'action': f\"Increase posting frequency for {pillars[0]['pillar']} content\" if pillars else \"Focus on top-performing content types\", 'priority': 1},\n            {'action': 'Analyze sentiment patterns to identify messaging improvements', 'priority': 2},\n            {'action': f\"Test new formats on {best_platform['platform']} platform\" if platforms else \"Optimize platform strategy\", 'priority': 3},\n            {'action': 'Review underperforming content for insights on what to avoid', 'priority': 4},\n            {'action': 'Set up engagement tracking dashboard for real-time monitoring', 'priority': 5}\n        ]
        
        return insights
    
    @staticmethod
    def generate_search_marketing_insights(analytics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate automatic insights for search marketing analytics
        Returns structured insights with keyword opportunities
        """
        if not analytics or 'overview' not in analytics:
            return {'error': 'No analytics data available'}
        
        insights = {
            'keyword_opportunities': [],
            'content_gaps': [],
            'intent_insights': [],
            'competitor_insights': [],
            'priority_strategy': []
        }
        
        overview = analytics.get('overview', {})
        total_keywords = overview.get('total_keywords', 0)
        total_volume = overview.get('total_search_volume', 0)
        avg_difficulty = overview.get('avg_keyword_difficulty', 0)
        
        # Top Opportunities Analysis
        opportunities = analytics.get('top_opportunities', [])
        if opportunities:
            top_opp = opportunities[0] if len(opportunities) > 0 else None
            if top_opp:
                insights['keyword_opportunities'].append({
                    'keyword': top_opp.get('keyword', ''),
                    'volume': top_opp.get('search_volume', 0),
                    'difficulty': top_opp.get('keyword_difficulty', 0),
                    'insight': f"High-priority target: {top_opp.get('search_volume', 0):,} monthly searches with difficulty score of {top_opp.get('keyword_difficulty', 0)}",
                    'action': 'Create comprehensive content targeting this keyword'
                })
            
            # Count easy opportunities
            easy_opps = [o for o in opportunities if o.get('keyword_difficulty', 100) < 30]
            if len(easy_opps) >= 3:
                insights['keyword_opportunities'].append({
                    'keyword': 'Multiple Low-Competition Keywords',
                    'volume': sum(o.get('search_volume', 0) for o in easy_opps[:5]),
                    'difficulty': 'Low (0-30)',
                    'insight': f"Found {len(easy_opps)} low-difficulty keywords with strong volume potential",
                    'action': 'Quick-win strategy: Target these first for fast rankings'
                })
        
        # Intent Distribution Insights
        intent_dist = analytics.get('intent_distribution', {})
        intent_volume = analytics.get('intent_volume', {})
        if intent_dist:
            total_intent = sum(intent_dist.values())
            
            for intent, count in intent_dist.items():
                percentage = (count / max(total_intent, 1)) * 100
                volume = intent_volume.get(intent, 0)
                
                if intent == 'Awareness' and percentage > 50:
                    insights['intent_insights'].append(
                        f"Awareness-stage keywords dominate ({percentage:.0f}%) - opportunity to capture early research phase."
                    )
                    insights['priority_strategy'].append({
                        'priority': 'High',
                        'strategy': 'Develop educational content for awareness stage',
                        'keywords': f"{count} keywords, {volume:,} total volume"
                    })
                elif intent == 'Purchase' and percentage > 20:
                    insights['intent_insights'].append(
                        f"Strong purchase intent presence ({percentage:.0f}%) - high conversion potential."
                    )
                    insights['priority_strategy'].append({
                        'priority': 'High',
                        'strategy': 'Optimize product pages and comparison content',
                        'keywords': f"{count} keywords, {volume:,} total volume"
                    })
                elif intent == 'Consideration':
                    insights['intent_insights'].append(
                        f"Consideration-stage keywords ({percentage:.0f}%) represent mid-funnel opportunities."
                    )
        
        # Difficulty Distribution Analysis
        difficulty_ranges = analytics.get('difficulty_ranges', {})
        if difficulty_ranges:
            easy_count = difficulty_ranges.get('Easy (0-30)', 0)
            medium_count = difficulty_ranges.get('Medium (31-60)', 0)
            hard_count = difficulty_ranges.get('Hard (61-100)', 0)
            
            if easy_count > total_keywords * 0.3:
                insights['content_gaps'].append(
                    f"Significant opportunity: {easy_count} low-difficulty keywords available for targeting."
                )
                insights['priority_strategy'].append({
                    'priority': 'Quick Win',
                    'strategy': 'Launch content campaign for easy-to-rank keywords',
                    'keywords': f"{easy_count} keywords identified"
                })
            
            if hard_count > total_keywords * 0.5:
                insights['content_gaps'].append(
                    f"High competition landscape: {hard_count} keywords require significant SEO investment."
                )
                insights['priority_strategy'].append({
                    'priority': 'Long-term',
                    'strategy': 'Build domain authority before targeting high-difficulty terms',
                    'keywords': f"{hard_count} keywords deferred"
                })
        
        # Volume Analysis
        if total_volume > 100000:
            insights['keyword_opportunities'].append({
                'keyword': 'Overall Market',
                'volume': total_volume,
                'difficulty': avg_difficulty,
                'insight': f"Large addressable market with {total_volume:,} monthly searches across {total_keywords} keywords",
                'action': 'Comprehensive content strategy recommended'
            })
        elif total_volume < 10000:
            insights['content_gaps'].append(
                f"Limited search volume ({total_volume:,}) suggests niche market or need for keyword expansion."
            )
        
        # Competitor Insights (placeholder - can be enhanced with actual competitor data)
        insights['competitor_insights'].append(
            "Analyze competitor content for successful keywords to identify gaps in your coverage."
        )
        
        # Strategic Recommendations
        insights['priority_strategy'].append({
            'priority': 'Foundation',
            'strategy': 'Optimize existing pages for highest-opportunity keywords',
            'keywords': 'Top 10 from opportunity list'
        })
        
        insights['priority_strategy'].append({
            'priority': 'Expansion',
            'strategy': 'Create new content clusters for underserved topics',
            'keywords': 'Mid-difficulty awareness keywords'
        })
        
        return insights
