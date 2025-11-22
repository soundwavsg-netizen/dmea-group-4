from services.scoring_service import ScoringService
from models import ReportResponse, MotivationScore, PainScore, DemographicBreakdown

class ReportService:
    
    @staticmethod
    def generate_report() -> ReportResponse:
        """Generate comprehensive report from raw scoring data (no platform weights)"""
        scoring_data = ScoringService.compute_raw_scores()
        
        if not scoring_data:
            # Return empty report
            return ReportResponse(
                total_insights=0,
                top_motivations=[],
                top_pains=[],
                demographics=DemographicBreakdown(
                    age_groups={},
                    genders={},
                    skin_types={},
                    skin_tones={},
                    lifestyles={}
                ),
                top_behaviours={},
                top_channels={},
                top_products={},
                avg_purchase_intent=0,
                avg_influencer_effect=0,
                intent_distribution={},
                influence_distribution={}
            )
        
        # Format motivations (raw scores don't have frequency)
        top_motivations = [
            MotivationScore(
                name=name,
                score=data['score']
            )
            for name, data in scoring_data['top_motivations']
        ]
        
        # Format pains (raw scores don't have frequency)
        top_pains = [
            PainScore(
                name=name,
                score=data['score']
            )
            for name, data in scoring_data['top_pains']
        ]
        
        # Demographics
        demographics = DemographicBreakdown(
            age_groups=scoring_data['demographics']['age_groups'],
            genders=scoring_data['demographics']['genders'],
            skin_types=scoring_data['demographics']['skin_types'],
            skin_tones=scoring_data['demographics']['skin_tones'],
            lifestyles=scoring_data['demographics']['lifestyles']
        )
        
        # Sort behaviours and channels by count
        top_behaviours = dict(
            sorted(
                scoring_data['behaviour_counts'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        )
        
        top_channels = dict(
            sorted(
                scoring_data['channel_counts'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        )
        
        top_products = dict(
            sorted(
                scoring_data['product_counts'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        )
        
        return ReportResponse(
            total_insights=scoring_data['total_insights'],
            top_motivations=top_motivations,
            top_pains=top_pains,
            demographics=demographics,
            top_behaviours=top_behaviours,
            top_channels=top_channels,
            top_products=top_products,
            platform_counts=scoring_data.get('platform_counts', {}),  # NEW
            avg_purchase_intent=scoring_data['avg_purchase_intent'],
            avg_influencer_effect=scoring_data['avg_influencer_effect'],
            intent_distribution=scoring_data['intent_distribution'],
            influence_distribution=scoring_data['influence_distribution']
        )
