"""
Analytics Engine for Social Media and Search Marketing
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Any
from collections import defaultdict, Counter


class AnalyticsEngineService:
    """Generate analytics from mapped data"""
    
    @staticmethod
    def social_media_analytics(mapped_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate social media analytics from mapped data
        Expected fields: platform, post_type, likes, comments, shares, saves, views, 
                        posting_date, sentiment, key_themes
        """
        try:
            if not mapped_data:
                return {'error': 'No data available for analytics'}
            
            # Engagement Overview
            total_posts = len(mapped_data)
            total_likes = sum(int(row.get('likes', 0) or 0) for row in mapped_data)
            total_comments = sum(int(row.get('comments', 0) or 0) for row in mapped_data)
            total_shares = sum(int(row.get('shares', 0) or 0) for row in mapped_data)
            total_views = sum(int(row.get('views', 0) or 0) for row in mapped_data)
            
            avg_engagement_rate = 0
            if total_views > 0:
                total_engagement = total_likes + total_comments + total_shares
                avg_engagement_rate = (total_engagement / total_views) * 100
            
            # Platform Comparison
            platform_stats = defaultdict(lambda: {'posts': 0, 'engagement': 0, 'views': 0})
            for row in mapped_data:
                platform = row.get('platform', 'Unknown')
                platform_stats[platform]['posts'] += 1
                platform_stats[platform]['engagement'] += int(row.get('likes', 0) or 0) + int(row.get('comments', 0) or 0)
                platform_stats[platform]['views'] += int(row.get('views', 0) or 0)
            
            # Content Pillar Performance (Post Type)
            post_type_stats = defaultdict(lambda: {'count': 0, 'avg_engagement': 0, 'total_engagement': 0})
            for row in mapped_data:
                post_type = row.get('post_type', 'Unknown')
                engagement = int(row.get('likes', 0) or 0) + int(row.get('comments', 0) or 0)
                post_type_stats[post_type]['count'] += 1
                post_type_stats[post_type]['total_engagement'] += engagement
            
            for post_type in post_type_stats:
                count = post_type_stats[post_type]['count']
                if count > 0:
                    post_type_stats[post_type]['avg_engagement'] = post_type_stats[post_type]['total_engagement'] / count
            
            # Sentiment Analysis
            sentiment_counts = Counter(row.get('sentiment', 'Unknown') for row in mapped_data)
            
            # Top Performing Posts
            top_posts = sorted(
                mapped_data,
                key=lambda x: int(x.get('likes', 0) or 0) + int(x.get('comments', 0) or 0) + int(x.get('shares', 0) or 0),
                reverse=True
            )[:10]
            
            return {
                'overview': {
                    'total_posts': total_posts,
                    'total_likes': total_likes,
                    'total_comments': total_comments,
                    'total_shares': total_shares,
                    'total_views': total_views,
                    'avg_engagement_rate': round(avg_engagement_rate, 2)
                },
                'platform_performance': dict(platform_stats),
                'content_pillars': dict(post_type_stats),
                'sentiment_distribution': dict(sentiment_counts),
                'top_posts': [
                    {
                        'platform': p.get('platform', 'Unknown'),
                        'post_type': p.get('post_type', 'Unknown'),
                        'likes': p.get('likes', 0),
                        'comments': p.get('comments', 0),
                        'shares': p.get('shares', 0)
                    }
                    for p in top_posts
                ]
            }
        except Exception as e:
            print(f"Error in social media analytics: {e}")
            return {'error': str(e)}
    
    @staticmethod
    def search_marketing_analytics(mapped_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate search marketing analytics from mapped data
        Expected fields: keyword, search_volume, keyword_difficulty, competition_level,
                        intent, brand_ranking, competitor_ranking
        """
        try:
            if not mapped_data:
                return {'error': 'No data available for analytics'}
            
            # Overview
            total_keywords = len(mapped_data)
            total_search_volume = sum(int(row.get('search_volume', 0) or 0) for row in mapped_data)
            avg_keyword_difficulty = sum(int(row.get('keyword_difficulty', 0) or 0) for row in mapped_data) / total_keywords if total_keywords > 0 else 0
            
            # Intent Funnel
            intent_distribution = Counter(row.get('intent', 'Unknown') for row in mapped_data)
            intent_volume = defaultdict(int)
            for row in mapped_data:
                intent = row.get('intent', 'Unknown')
                intent_volume[intent] += int(row.get('search_volume', 0) or 0)
            
            # Keyword Opportunities (high volume, low difficulty)
            opportunities = []
            for row in mapped_data:
                volume = int(row.get('search_volume', 0) or 0)
                difficulty = int(row.get('keyword_difficulty', 0) or 0)
                if volume > 0:
                    opportunity_score = volume / (difficulty + 1)  # +1 to avoid division by zero
                    opportunities.append({
                        'keyword': row.get('keyword', 'Unknown'),
                        'search_volume': volume,
                        'keyword_difficulty': difficulty,
                        'opportunity_score': round(opportunity_score, 2)
                    })
            
            opportunities.sort(key=lambda x: x['opportunity_score'], reverse=True)
            top_opportunities = opportunities[:20]
            
            # Difficulty Distribution
            difficulty_ranges = {
                'Easy (0-30)': 0,
                'Medium (31-60)': 0,
                'Hard (61-100)': 0
            }
            for row in mapped_data:
                difficulty = int(row.get('keyword_difficulty', 0) or 0)
                if difficulty <= 30:
                    difficulty_ranges['Easy (0-30)'] += 1
                elif difficulty <= 60:
                    difficulty_ranges['Medium (31-60)'] += 1
                else:
                    difficulty_ranges['Hard (61-100)'] += 1
            
            return {
                'overview': {
                    'total_keywords': total_keywords,
                    'total_search_volume': total_search_volume,
                    'avg_keyword_difficulty': round(avg_keyword_difficulty, 2)
                },
                'intent_distribution': dict(intent_distribution),
                'intent_volume': dict(intent_volume),
                'difficulty_ranges': difficulty_ranges,
                'top_opportunities': top_opportunities
            }
        except Exception as e:
            print(f"Error in search marketing analytics: {e}")
            return {'error': str(e)}
