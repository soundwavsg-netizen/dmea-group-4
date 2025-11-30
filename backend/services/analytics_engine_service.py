"""
Analytics Engine for Social Media and Search Marketing
Implements exact formulas and business logic as specified
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Any
from collections import defaultdict, Counter


class AnalyticsEngineService:
    """Generate analytics from mapped data with exact formulas"""
    
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
            
            # Data quality warnings
            data_warnings = []
            skipped_rows = []
            
            # Helper function to safely convert to numeric
            def safe_num(value, default=0):
                try:
                    return float(value) if value not in [None, '', 'null'] else default
                except (ValueError, TypeError):
                    return default
            
            # Validate and filter data
            valid_data = []
            for idx, row in enumerate(mapped_data, start=1):
                issues = []
                platform = row.get('platform', '')
                post_type = row.get('post_type', '')
                
                # Check critical fields
                if not platform or platform in ['', 'null', None]:
                    issues.append('Missing Platform')
                if not post_type or post_type in ['', 'null', None]:
                    issues.append('Missing Post Type')
                
                # Check if all engagement metrics are zero/missing
                likes = safe_num(row.get('likes', 0))
                comments = safe_num(row.get('comments', 0))
                shares = safe_num(row.get('shares', 0))
                saves = safe_num(row.get('saves', 0))
                views = safe_num(row.get('views', 0))
                
                if likes == 0 and comments == 0 and shares == 0 and saves == 0 and views == 0:
                    issues.append('No engagement data')
                
                if issues:
                    skipped_rows.append({
                        'row': idx,
                        'platform': platform or 'N/A',
                        'post_type': post_type or 'N/A',
                        'issues': ', '.join(issues)
                    })
                else:
                    valid_data.append(row)
            
            # Add warning if rows were skipped
            if skipped_rows:
                data_warnings.append({
                    'type': 'warning',
                    'message': f'{len(skipped_rows)} row(s) skipped due to missing critical data',
                    'details': skipped_rows[:10]  # Show first 10 problematic rows
                })
            
            # If no valid data remains, return error
            if not valid_data:
                return {
                    'error': 'No valid data available for analytics',
                    'warnings': data_warnings
                }
            
            # Use valid_data instead of mapped_data for calculations
            mapped_data = valid_data
            
            # Calculate engagement rate for each post using EXACT formula
            posts_with_engagement = []
            for row in mapped_data:
                likes = safe_num(row.get('likes', 0))
                comments = safe_num(row.get('comments', 0))
                shares = safe_num(row.get('shares', 0))
                saves = safe_num(row.get('saves', 0))
                views = safe_num(row.get('views', 0))
                
                total_engagement = likes + comments + shares + saves
                
                # Engagement Rate = (Likes + Comments + Shares + Saves) / Views
                # Fallback if Views missing: just use total engagement
                if views > 0:
                    engagement_rate = total_engagement / views
                else:
                    engagement_rate = total_engagement  # Fallback
                
                posts_with_engagement.append({
                    **row,
                    'engagement_rate': engagement_rate,
                    'total_engagement': total_engagement
                })
            
            # Overall metrics
            total_posts = len(posts_with_engagement)
            avg_engagement_rate = sum(p['engagement_rate'] for p in posts_with_engagement) / max(total_posts, 1)
            total_likes = sum(safe_num(p.get('likes', 0)) for p in posts_with_engagement)
            total_comments = sum(safe_num(p.get('comments', 0)) for p in posts_with_engagement)
            total_shares = sum(safe_num(p.get('shares', 0)) for p in posts_with_engagement)
            total_saves = sum(safe_num(p.get('saves', 0)) for p in posts_with_engagement)
            total_views = sum(safe_num(p.get('views', 0)) for p in posts_with_engagement)
            
            # CONTENT PILLAR PERFORMANCE
            # Group by Post Type, calculate avg engagement rate, avg views, total posts
            pillar_stats = defaultdict(lambda: {'posts': [], 'total_posts': 0, 'total_engagement': 0, 'total_views': 0})
            for post in posts_with_engagement:
                post_type = post.get('post_type', 'Unknown')
                pillar_stats[post_type]['posts'].append(post)
                pillar_stats[post_type]['total_posts'] += 1
                pillar_stats[post_type]['total_engagement'] += post['total_engagement']
                pillar_stats[post_type]['total_views'] += safe_num(post.get('views', 0))
            
            content_pillars = []
            for pillar_name, stats in pillar_stats.items():
                posts = stats['posts']
                avg_engagement_rate = sum(p['engagement_rate'] for p in posts) / len(posts)
                avg_views = stats['total_views'] / len(posts)
                
                content_pillars.append({
                    'pillar': pillar_name,
                    'total_posts': stats['total_posts'],
                    'avg_engagement_rate': round(avg_engagement_rate, 4),
                    'avg_views': round(avg_views, 2),
                    'posts': posts  # Include for Push/Fix/Drop analysis
                })
            
            # Sort descending by engagement rate
            content_pillars.sort(key=lambda x: x['avg_engagement_rate'], reverse=True)
            
            # PLATFORM COMPARISON
            # Group by Platform: avg engagement rate, avg views, avg shares, posting frequency
            platform_stats = defaultdict(lambda: {'posts': [], 'total_shares': 0, 'total_views': 0})
            for post in posts_with_engagement:
                platform = post.get('platform', 'Unknown')
                platform_stats[platform]['posts'].append(post)
                platform_stats[platform]['total_shares'] += safe_num(post.get('shares', 0))
                platform_stats[platform]['total_views'] += safe_num(post.get('views', 0))
            
            platform_comparison = []
            for platform_name, stats in platform_stats.items():
                posts = stats['posts']
                avg_engagement_rate = sum(p['engagement_rate'] for p in posts) / len(posts)
                avg_views = stats['total_views'] / len(posts)
                avg_shares = stats['total_shares'] / len(posts)
                posting_frequency = len(posts)
                
                platform_comparison.append({
                    'platform': platform_name,
                    'posting_frequency': posting_frequency,
                    'avg_engagement_rate': round(avg_engagement_rate, 4),
                    'avg_views': round(avg_views, 2),
                    'avg_shares': round(avg_shares, 2)
                })
            
            # SENTIMENT HEATMAP
            # Group by Key Themes × Sentiment
            sentiment_heatmap = defaultdict(lambda: defaultdict(int))
            for post in posts_with_engagement:
                themes = post.get('key_themes', 'Unknown')
                sentiment = post.get('sentiment', 'Unknown')
                sentiment_heatmap[themes][sentiment] += 1
            
            # Convert to list format
            sentiment_data = []
            for theme, sentiments in sentiment_heatmap.items():
                for sentiment, count in sentiments.items():
                    sentiment_data.append({
                        'theme': theme,
                        'sentiment': sentiment,
                        'count': count
                    })
            
            # PUSH / FIX / DROP MODEL
            push_items = []
            fix_items = []
            drop_items = []
            
            # More practical thresholds: top performer gets push, bottom gets drop
            # Sort pillars by engagement to find top and bottom performers
            sorted_pillars = sorted(content_pillars, key=lambda x: x['avg_engagement_rate'], reverse=True)
            high_engagement_threshold = avg_engagement_rate * 0.98  # At or slightly below average
            low_engagement_threshold = avg_engagement_rate * 0.85   # 15% below average
            
            for pillar in content_pillars:
                pillar_posts = pillar['posts']
                pillar_engagement = pillar['avg_engagement_rate']
                pillar_name = pillar['pillar']
                
                # Skip if no posts
                if not pillar_posts:
                    continue
                
                # Check sentiment distribution for this pillar
                positive_count = sum(1 for p in pillar_posts if str(p.get('sentiment', '')).lower() in ['positive', 'pos'])
                negative_count = sum(1 for p in pillar_posts if str(p.get('sentiment', '')).lower() in ['negative', 'neg'])
                total_pillar_posts = len(pillar_posts)
                positive_ratio = positive_count / max(total_pillar_posts, 1)
                negative_ratio = negative_count / max(total_pillar_posts, 1)
                
                # Debug logging
                print(f"[P/F/D Debug] {pillar_name}: eng={pillar_engagement:.4f}, pos={positive_count}/{total_pillar_posts}, neg={negative_count}/{total_pillar_posts}")
                
                # PUSH: Above average engagement AND majority positive sentiment (or neutral with high engagement)
                if pillar_engagement >= high_engagement_threshold and positive_ratio >= 0.5:
                    push_items.append({
                        'type': pillar_name,
                        'engagement_rate': round(pillar_engagement, 4),
                        'reason': f'Strong engagement ({round(pillar_engagement * 100, 2)}%) with {int(positive_ratio * 100)}% positive sentiment',
                        'action': f'Increase {pillar_name} content frequency by 25-50%'
                    })
                
                # FIX: Good engagement BUT significant negative sentiment (>30%)
                elif pillar_engagement >= avg_engagement_rate * 0.9 and negative_ratio > 0.3:
                    fix_items.append({
                        'type': pillar_name,
                        'engagement_rate': round(pillar_engagement, 4),
                        'reason': f'Decent engagement ({round(pillar_engagement * 100, 2)}%) but {int(negative_ratio * 100)}% negative sentiment',
                        'action': f'Audit {pillar_name} messaging to address concerns and improve sentiment'
                    })
                
                # DROP: Below average engagement AND low views
                elif pillar_engagement <= low_engagement_threshold and pillar['avg_views'] < (total_views / total_posts * 0.7):
                    drop_items.append({
                        'type': pillar_name,
                        'engagement_rate': round(pillar_engagement, 4),
                        'reason': f'Below average engagement ({round(pillar_engagement * 100, 2)}%) with limited reach ({int(pillar["avg_views"])} avg views)',
                        'action': f'Consider pausing {pillar_name} content or testing new approaches'
                    })
            
            # TOP PERFORMING POSTS
            top_posts = sorted(
                posts_with_engagement,
                key=lambda x: x['total_engagement'],
                reverse=True
            )[:10]
            
            return {
                'warnings': data_warnings if data_warnings else None,
                'overview': {
                    'total_posts': total_posts,
                    'total_likes': int(total_likes),
                    'total_comments': int(total_comments),
                    'total_shares': int(total_shares),
                    'total_saves': int(total_saves),
                    'total_views': int(total_views),
                    'avg_engagement_rate': round(avg_engagement_rate, 4)
                },
                'content_pillars': [{
                    'pillar': p['pillar'],
                    'total_posts': p['total_posts'],
                    'avg_engagement_rate': p['avg_engagement_rate'],
                    'avg_views': p['avg_views']
                } for p in content_pillars],
                'platform_comparison': platform_comparison,
                'sentiment_heatmap': sentiment_data,
                'push_fix_drop': {
                    'push': push_items,
                    'fix': fix_items,
                    'drop': drop_items
                },
                'top_posts': [{
                    'platform': p.get('platform', 'Unknown'),
                    'post_type': p.get('post_type', 'Unknown'),
                    'likes': safe_num(p.get('likes', 0)),
                    'comments': safe_num(p.get('comments', 0)),
                    'shares': safe_num(p.get('shares', 0)),
                    'engagement_rate': round(p['engagement_rate'], 4)
                } for p in top_posts]
            }
        except Exception as e:
            print(f"Error in social media analytics: {e}")
            import traceback
            traceback.print_exc()
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
            
            # Data quality warnings
            data_warnings = []
            skipped_rows = []
            
            def safe_num(value, default=0):
                try:
                    return float(value) if value not in [None, '', 'null'] else default
                except (ValueError, TypeError):
                    return default
            
            # Validate and filter data
            valid_data = []
            for idx, row in enumerate(mapped_data, start=1):
                issues = []
                keyword = row.get('keyword', '')
                volume = safe_num(row.get('search_volume', 0))
                difficulty = safe_num(row.get('keyword_difficulty', 0))
                
                # Check critical fields
                if not keyword or keyword in ['', 'null', None]:
                    issues.append('Missing Keyword')
                if volume <= 0:
                    issues.append('Missing/Zero Search Volume')
                if difficulty <= 0:
                    issues.append('Missing Keyword Difficulty')
                
                if issues:
                    skipped_rows.append({
                        'row': idx,
                        'keyword': keyword or 'N/A',
                        'issues': ', '.join(issues)
                    })
                else:
                    valid_data.append(row)
            
            # Add warning if rows were skipped
            if skipped_rows:
                data_warnings.append({
                    'type': 'warning',
                    'message': f'{len(skipped_rows)} keyword(s) skipped due to missing critical data',
                    'details': skipped_rows[:10]
                })
            
            # If no valid data remains, return error
            if not valid_data:
                return {
                    'error': 'No valid data available for analytics',
                    'warnings': data_warnings
                }
            
            # Use valid_data for calculations
            mapped_data = valid_data
            
            # INTENT WEIGHTS
            INTENT_WEIGHTS = {
                'awareness': 1,
                'consideration': 1.5,
                'purchase': 2
            }
            
            # Calculate Keyword Opportunity Score for each keyword
            keywords_with_scores = []
            for row in mapped_data:
                keyword = row.get('keyword', 'Unknown')
                volume = safe_num(row.get('search_volume', 0))
                difficulty = safe_num(row.get('keyword_difficulty', 0))
                intent = str(row.get('intent', 'awareness')).lower()
                competition = row.get('competition_level', 'Unknown')
                brand_rank = row.get('brand_ranking', None)
                competitor_rank = row.get('competitor_ranking', None)
                
                # Opportunity Score = (Search Volume / Keyword Difficulty) × Intent Weight
                intent_weight = INTENT_WEIGHTS.get(intent, 1)
                if difficulty > 0:
                    opportunity_score = (volume / difficulty) * intent_weight
                else:
                    opportunity_score = volume * intent_weight  # If difficulty is 0, just use volume * weight
                
                keywords_with_scores.append({
                    'keyword': keyword,
                    'search_volume': int(volume),
                    'keyword_difficulty': int(difficulty),
                    'competition_level': competition,
                    'intent': intent,
                    'intent_weight': intent_weight,
                    'brand_ranking': brand_rank,
                    'competitor_ranking': competitor_rank,
                    'opportunity_score': round(opportunity_score, 2)
                })
            
            # Overview
            total_keywords = len(keywords_with_scores)
            total_search_volume = sum(k['search_volume'] for k in keywords_with_scores)
            avg_keyword_difficulty = sum(k['keyword_difficulty'] for k in keywords_with_scores) / max(total_keywords, 1)
            
            # KEYWORD OPPORTUNITY MAP
            # Data for plotting: X=Difficulty, Y=Volume, Size=Intent Weight, Color=Competition Level
            opportunity_map = [{
                'keyword': k['keyword'],
                'x': k['keyword_difficulty'],
                'y': k['search_volume'],
                'size': k['intent_weight'] * 100,  # Scale for visualization
                'color': k['competition_level']
            } for k in keywords_with_scores]
            
            # INTENT FUNNEL
            # Group by intent → count → avg volume → avg difficulty
            intent_funnel = defaultdict(lambda: {'count': 0, 'total_volume': 0, 'total_difficulty': 0})
            for kw in keywords_with_scores:
                intent = kw['intent']
                intent_funnel[intent]['count'] += 1
                intent_funnel[intent]['total_volume'] += kw['search_volume']
                intent_funnel[intent]['total_difficulty'] += kw['keyword_difficulty']
            
            intent_data = []
            for intent, stats in intent_funnel.items():
                intent_data.append({
                    'intent': intent.capitalize(),
                    'count': stats['count'],
                    'avg_volume': round(stats['total_volume'] / stats['count'], 2),
                    'avg_difficulty': round(stats['total_difficulty'] / stats['count'], 2),
                    'total_volume': stats['total_volume']
                })
            
            # COMPETITOR RANKING & GAP ANALYSIS
            competitor_gaps = []
            for kw in keywords_with_scores:
                brand_rank = kw.get('brand_ranking')
                competitor_rank = kw.get('competitor_ranking')
                
                # Gap = CompetitorRank – BrandRank
                if brand_rank and competitor_rank:
                    try:
                        brand_r = int(brand_rank)
                        comp_r = int(competitor_rank)
                        gap = comp_r - brand_r  # Positive = we rank better, Negative = competitor ranks better
                        competitor_gaps.append({
                            'keyword': kw['keyword'],
                            'brand_rank': brand_r,
                            'competitor_rank': comp_r,
                            'gap': gap,
                            'volume': kw['search_volume']
                        })
                    except (ValueError, TypeError):
                        pass
            
            # CONTENT GAP ANALYSIS
            # Keywords where MUFE Rank = blank/null AND Competitor Rank ≠ blank
            content_gaps = []
            for kw in keywords_with_scores:
                brand_rank = kw.get('brand_ranking')
                competitor_rank = kw.get('competitor_ranking')
                
                if (not brand_rank or brand_rank in ['', 'null', None]) and competitor_rank and competitor_rank not in ['', 'null', None]:
                    content_gaps.append({
                        'keyword': kw['keyword'],
                        'competitor_rank': competitor_rank,
                        'volume': kw['search_volume'],
                        'difficulty': kw['keyword_difficulty'],
                        'opportunity_score': kw['opportunity_score']
                    })
            
            # Sort content gaps by opportunity score
            content_gaps.sort(key=lambda x: x['opportunity_score'], reverse=True)
            
            # TOP 10 KEYWORDS by Opportunity Score
            top_keywords = sorted(keywords_with_scores, key=lambda x: x['opportunity_score'], reverse=True)[:10]
            
            # Generate content suggestions for top keywords
            top_keywords_with_suggestions = []
            for kw in top_keywords:
                suggestion = f"Create comprehensive guide on '{kw['keyword']}'"
                if kw['intent'] == 'awareness':
                    suggestion = f"Create educational content: 'What is {kw['keyword']}?'"
                elif kw['intent'] == 'consideration':
                    suggestion = f"Create comparison: '{kw['keyword']} - Complete Guide'"
                elif kw['intent'] == 'purchase':
                    suggestion = f"Optimize product page for '{kw['keyword']}'"
                
                top_keywords_with_suggestions.append({
                    'keyword': kw['keyword'],
                    'opportunity_score': kw['opportunity_score'],
                    'volume': kw['search_volume'],
                    'difficulty': kw['keyword_difficulty'],
                    'intent': kw['intent'].capitalize(),
                    'content_suggestion': suggestion
                })
            
            # DIFFICULTY DISTRIBUTION
            difficulty_ranges = {
                'Easy (0-30)': sum(1 for k in keywords_with_scores if k['keyword_difficulty'] <= 30),
                'Medium (31-60)': sum(1 for k in keywords_with_scores if 31 <= k['keyword_difficulty'] <= 60),
                'Hard (61-100)': sum(1 for k in keywords_with_scores if k['keyword_difficulty'] > 60)
            }
            
            return {
                'warnings': data_warnings if data_warnings else None,
                'overview': {
                    'total_keywords': total_keywords,
                    'total_search_volume': int(total_search_volume),
                    'avg_keyword_difficulty': round(avg_keyword_difficulty, 2)
                },
                'opportunity_map': opportunity_map,
                'intent_funnel': intent_data,
                'competitor_ranking': competitor_gaps[:20],  # Top 20
                'content_gaps': content_gaps[:20],  # Top 20 gaps
                'top_keywords': top_keywords_with_suggestions,
                'difficulty_distribution': difficulty_ranges
            }
        except Exception as e:
            print(f"Error in search marketing analytics: {e}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}
