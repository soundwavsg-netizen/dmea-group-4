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
        Returns structured insights with recommendations
        """
        if not analytics or 'overview' not in analytics:
            return {'error': 'No analytics data available'}
        
        insights = {
            'top_insights': [],
            'push_fix_drop': {'push': [], 'fix': [], 'drop': []},
            'trend_signals': [],
            'competitive_opportunities': [],
            'final_recommendations': []
        }
        
        # Overview metrics
        overview = analytics.get('overview', {})
        total_posts = overview.get('total_posts', 0)
        avg_engagement_rate = overview.get('avg_engagement_rate', 0)
        
        # Platform Performance Insights
        platforms = analytics.get('platform_performance', {})
        if platforms:
            # Find best performing platform
            best_platform = max(platforms.items(), key=lambda x: x[1].get('engagement', 0))
            insights['top_insights'].append(
                f"{best_platform[0]} drives the highest engagement with {best_platform[1].get('engagement', 0)} total interactions across {best_platform[1].get('posts', 0)} posts."
            )
            
            # Find platform with most views
            views_leader = max(platforms.items(), key=lambda x: x[1].get('views', 0))
            if views_leader[0] != best_platform[0]:
                insights['top_insights'].append(
                    f"{views_leader[0]} drives the highest reach with {views_leader[1].get('views', 0)} total views."
                )
        
        # Content Pillar Performance
        pillars = analytics.get('content_pillars', {})
        if pillars:
            sorted_pillars = sorted(pillars.items(), key=lambda x: x[1].get('avg_engagement', 0), reverse=True)
            
            if len(sorted_pillars) >= 2:
                best_pillar = sorted_pillars[0]
                worst_pillar = sorted_pillars[-1]
                
                ratio = best_pillar[1].get('avg_engagement', 0) / max(worst_pillar[1].get('avg_engagement', 1), 1)
                insights['top_insights'].append(
                    f"{best_pillar[0]} content generates {ratio:.1f}× higher engagement than {worst_pillar[0]} posts."
                )
                
                # Push recommendation
                if best_pillar[1].get('avg_engagement', 0) > avg_engagement_rate:
                    insights['push_fix_drop']['push'].append({
                        'type': best_pillar[0],
                        'reason': f'High engagement ({int(best_pillar[1].get("avg_engagement", 0))}) above average',
                        'action': f'Increase {best_pillar[0]} content frequency'
                    })
                
                # Drop recommendation
                if worst_pillar[1].get('avg_engagement', 0) < avg_engagement_rate * 0.5:
                    insights['push_fix_drop']['drop'].append({
                        'type': worst_pillar[0],
                        'reason': f'Low engagement ({int(worst_pillar[1].get("avg_engagement", 0))}) significantly below average',
                        'action': f'Reduce or restructure {worst_pillar[0]} content'
                    })
        
        # Sentiment Analysis Insights
        sentiment = analytics.get('sentiment_distribution', {})
        if sentiment:
            total_sentiment = sum(sentiment.values())
            positive_rate = sentiment.get('Positive', 0) / max(total_sentiment, 1) * 100
            negative_rate = sentiment.get('Negative', 0) / max(total_sentiment, 1) * 100
            
            if positive_rate > 60:
                insights['top_insights'].append(
                    f"Strong positive sentiment ({positive_rate:.0f}%) indicates high audience satisfaction."
                )
            elif negative_rate > 30:
                insights['top_insights'].append(
                    f"Elevated negative sentiment ({negative_rate:.0f}%) requires content strategy review."
                )
                insights['push_fix_drop']['fix'].append({
                    'type': 'Overall Content',
                    'reason': f'{negative_rate:.0f}% negative sentiment',
                    'action': 'Review pain points and adjust messaging'
                })
        
        # Engagement Rate Insights
        if avg_engagement_rate > 5:
            insights['top_insights'].append(
                f"Exceptional engagement rate of {avg_engagement_rate:.1f}% indicates strong content-market fit."
            )
        elif avg_engagement_rate < 2:
            insights['top_insights'].append(
                f"Engagement rate of {avg_engagement_rate:.1f}% below industry average - optimization needed."
            )
            insights['final_recommendations'].append({
                'priority': 'High',
                'action': 'Audit content hooks and calls-to-action',
                'expected_impact': 'Increase engagement by 2-3x'
            })
        
        # Final Recommendations
        insights['final_recommendations'].append({
            'priority': 'High',
            'action': 'Create more of top-performing content types',
            'expected_impact': 'Maintain engagement momentum'
        })
        
        if len(insights['push_fix_drop']['push']) > 0:
            insights['final_recommendations'].append({
                'priority': 'Medium',
                'action': f"Double down on {insights['push_fix_drop']['push'][0]['type']} content",
                'expected_impact': 'Capitalize on proven performance'
            })
        
        insights['final_recommendations'].append({
            'priority': 'Medium',
            'action': 'Test new content formats in underperforming categories',
            'expected_impact': 'Discover new growth opportunities'
        })
        
        # Trend Signals (basic implementation)
        if pillars:
            for pillar_name, stats in pillars.items():
                if stats.get('count', 0) > 5:  # Sufficient data
                    insights['trend_signals'].append(
                        f"{pillar_name} content showing consistent performance with {stats.get('count', 0)} posts published."
                    )
        
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
