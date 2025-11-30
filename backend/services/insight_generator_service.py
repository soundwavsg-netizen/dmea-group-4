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
        
        # Sentiment Analysis Insights
        sentiment_data = analytics.get('sentiment_heatmap', [])
        if sentiment_data:
            sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
            for item in sentiment_data:
                sent = str(item.get('sentiment', '')).lower()
                if 'pos' in sent:
                    sentiment_counts['positive'] += item.get('count', 0)
                elif 'neg' in sent:
                    sentiment_counts['negative'] += item.get('count', 0)
                else:
                    sentiment_counts['neutral'] += item.get('count', 0)
            
            total_sentiment = sum(sentiment_counts.values())
            if total_sentiment > 0:
                positive_rate = (sentiment_counts['positive'] / total_sentiment) * 100
                negative_rate = (sentiment_counts['negative'] / total_sentiment) * 100
                
                if positive_rate > 60:
                    insights['top_insights'].append(
                        f"Strong positive sentiment ({positive_rate:.0f}%) indicates high audience satisfaction and content resonance."
                    )
                elif negative_rate > 30:
                    insights['top_insights'].append(
                        f"Elevated negative sentiment ({negative_rate:.0f}%) signals need for content strategy review."
                    )
        
        # Engagement Rate Insights
        if avg_engagement_rate > 0.05:  # 5%
            insights['top_insights'].append(
                f"Exceptional engagement rate of {round(avg_engagement_rate * 100, 2)}% indicates strong content-market fit."
            )
        elif avg_engagement_rate < 0.02:  # 2%
            insights['top_insights'].append(
                f"Engagement rate of {round(avg_engagement_rate * 100, 2)}% below industry average - optimization needed."
            )
        
        # Limit to top 5 insights
        insights['top_insights'] = insights['top_insights'][:5]
        
        # STRATEGIC RECOMMENDATIONS
        push_count = len(insights['push_fix_drop']['push'])
        fix_count = len(insights['push_fix_drop']['fix'])
        drop_count = len(insights['push_fix_drop']['drop'])
        
        if push_count > 0:
            insights['strategic_recommendations'].append({
                'priority': 'High',
                'action': f"Scale production of {', '.join([p['type'] for p in insights['push_fix_drop']['push'][:2]])} content",
                'expected_impact': 'Maximize engagement and audience growth'
            })
        
        if fix_count > 0:
            insights['strategic_recommendations'].append({
                'priority': 'High',
                'action': f"Improve messaging for {', '.join([f['type'] for f in insights['push_fix_drop']['fix'][:2]])} to address negative sentiment",
                'expected_impact': 'Convert engagement into positive brand perception'
            })
        
        if drop_count > 0:
            insights['strategic_recommendations'].append({
                'priority': 'Medium',
                'action': f"Reduce or restructure {', '.join([d['type'] for d in insights['push_fix_drop']['drop'][:2]])} content",
                'expected_impact': 'Reallocate resources to high-performing content'
            })
        
        insights['strategic_recommendations'].append({
            'priority': 'Medium',
            'action': 'A/B test new content formats within top-performing pillars',
            'expected_impact': 'Discover optimization opportunities'
        })
        
        # PERSONA ALIGNMENT
        top_pillar_name = pillars[0]['pillar'] if pillars and len(pillars) > 0 else 'top content types'
        if avg_engagement_rate > 0.03:
            insights['persona_alignment'] = f"Content resonates strongly with target audience (avg {round(avg_engagement_rate * 100, 2)}% engagement). Continue current persona targeting with focus on {top_pillar_name}."
        else:
            insights['persona_alignment'] = f"Engagement below target ({round(avg_engagement_rate * 100, 2)}%). Review persona assumptions and test content variations to better match audience preferences."
        
        # PRIORITY ACTIONS
        insights['priority_actions'] = [
            {'action': f"Increase posting frequency for {pillars[0]['pillar']} content" if pillars else "Focus on top-performing content types", 'priority': 1},
            {'action': 'Analyze sentiment patterns to identify messaging improvements', 'priority': 2},
            {'action': f"Test new formats on {best_platform['platform']} platform" if platforms else "Optimize platform strategy", 'priority': 3},
            {'action': 'Review underperforming content for insights on what to avoid', 'priority': 4},
            {'action': 'Set up engagement tracking dashboard for real-time monitoring', 'priority': 5}
        ]
        
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
                f"Highest opportunity keyword: '{top_kw['keyword']}' ({top_kw['volume']:,} monthly searches, difficulty {top_kw['difficulty']}, score {top_kw['opportunity_score']})"
            )
        
        # Intent distribution
        intent_data = analytics.get('intent_funnel', [])
        if intent_data:
            # Find dominant intent
            dominant_intent = max(intent_data, key=lambda x: x['count'])
            insights['top_insights'].append(
                f"{dominant_intent['intent']} intent dominates with {dominant_intent['count']} keywords ({dominant_intent['total_volume']:,} total volume)"
            )
            
            # Check for purchase intent
            purchase_data = [i for i in intent_data if i['intent'].lower() == 'purchase']
            if purchase_data and len(purchase_data) > 0:
                purchase = purchase_data[0]
                if purchase['count'] > total_keywords * 0.15:
                    insights['top_insights'].append(
                        f"Strong purchase intent presence ({purchase['count']} keywords) indicates high conversion potential"
                    )
        
        # Difficulty distribution
        difficulty_dist = analytics.get('difficulty_distribution', {})
        easy_count = difficulty_dist.get('Easy (0-30)', 0)
        if easy_count > total_keywords * 0.2:
            insights['top_insights'].append(
                f"Quick-win opportunity: {easy_count} low-difficulty keywords available ({int(easy_count/total_keywords*100)}% of portfolio)"
            )
        
        # Content gaps
        content_gaps = analytics.get('content_gaps', [])
        if len(content_gaps) > 0:
            gap_volume = sum(g.get('volume', 0) for g in content_gaps[:10])
            insights['top_insights'].append(
                f"Content gap analysis reveals {len(content_gaps)} keywords where competitors rank but you don't (top 10 = {gap_volume:,} volume)"
            )
        
        # Limit to top 5
        insights['top_insights'] = insights['top_insights'][:5]
        
        # KEYWORD OPPORTUNITIES (from top_keywords)
        insights['keyword_opportunities'] = top_keywords[:10]  # Already includes content suggestions
        
        # STRATEGIC RECOMMENDATIONS
        if easy_count >= 3:
            insights['strategic_recommendations'].append({
                'priority': 'High',
                'action': f"Launch quick-win campaign targeting {easy_count} easy-to-rank keywords",
                'expected_impact': 'Fast rankings within 3-6 months'
            })
        
        if len(content_gaps) > 5:
            insights['strategic_recommendations'].append({
                'priority': 'High',
                'action': f"Fill top {min(len(content_gaps), 10)} content gaps where competitors dominate",
                'expected_impact': 'Capture competitor traffic'
            })
        
        # Intent-based recommendations
        if intent_data:
            for intent_item in intent_data:
                intent_name = intent_item['intent']
                if intent_name.lower() == 'purchase' and intent_item['count'] > 0:
                    insights['strategic_recommendations'].append({
                        'priority': 'High',
                        'action': f"Optimize product pages for {intent_item['count']} purchase-intent keywords",
                        'expected_impact': 'Direct revenue impact'
                    })
                    break
        
        insights['strategic_recommendations'].append({
            'priority': 'Medium',
            'action': 'Build content clusters around top opportunity themes',
            'expected_impact': 'Establish topical authority'
        })
        
        insights['strategic_recommendations'].append({
            'priority': 'Medium',
            'action': 'Monitor competitor keyword movements monthly',
            'expected_impact': 'Stay ahead of market shifts'
        })
        
        # PRIORITY ACTIONS
        if len(top_keywords) > 0:
            insights['priority_actions'] = [
                {'action': f"Create content for '{top_keywords[0]['keyword']}'" if len(top_keywords) > 0 else "Target top opportunity keyword", 'priority': 1},
                {'action': f"Fill top 3 content gaps: {', '.join([g['keyword'] for g in content_gaps[:3]])}" if len(content_gaps) >= 3 else "Address content gaps", 'priority': 2},
                {'action': 'Optimize existing pages for medium-difficulty keywords', 'priority': 3},
                {'action': 'Build backlink strategy for high-difficulty targets', 'priority': 4},
                {'action': 'Set up rank tracking for top 20 opportunity keywords', 'priority': 5}
            ]
        else:
            insights['priority_actions'] = [
                {'action': 'Conduct keyword research to identify opportunities', 'priority': 1},
                {'action': 'Audit existing content for optimization potential', 'priority': 2},
                {'action': 'Analyze competitor keyword strategies', 'priority': 3}
            ]
        
        return insights
