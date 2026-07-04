from app.models.schemas import RiskAssessmentRequest, RiskAssessmentResponse


class RiskAnalysisService:
    SEVERITY_WEIGHTS = {
        "low": 0.2,
        "medium": 0.5,
        "high": 0.8,
        "critical": 1.0,
    }

    ZONE_RISK_FACTORS = {
        "chemical_storage": 0.9,
        "assembly_line": 0.6,
        "warehouse": 0.5,
        "office": 0.2,
        "construction": 0.8,
        "default": 0.5,
    }

    async def assess_risk(self, request: RiskAssessmentRequest) -> RiskAssessmentResponse:
        severity_weight = self.SEVERITY_WEIGHTS.get(request.severity, 0.5)
        zone_factor = self.ZONE_RISK_FACTORS.get(request.zone, 0.5)
        historical_factor = min(request.historical_incidents / 100, 1.0)

        risk_score = (
            severity_weight * 0.4
            + zone_factor * 0.3
            + historical_factor * 0.3
        )

        risk_score = min(max(risk_score, 0.0), 1.0)

        if risk_score >= 0.8:
            risk_level = "critical"
            recommendations = [
                "Immediate evacuation of zone",
                "Notify emergency response team",
                "Secure the area",
            ]
        elif risk_score >= 0.6:
            risk_level = "high"
            recommendations = [
                "Increase monitoring frequency",
                "Assign safety officer to zone",
                "Conduct immediate inspection",
            ]
        elif risk_score >= 0.3:
            risk_level = "medium"
            recommendations = [
                "Schedule safety review",
                "Monitor zone conditions",
                "Review safety protocols",
            ]
        else:
            risk_level = "low"
            recommendations = [
                "Continue regular monitoring",
                "Maintain current protocols",
            ]

        confidence = 0.85 + (1.0 - risk_score) * 0.1

        return RiskAssessmentResponse(
            risk_score=round(risk_score, 3),
            risk_level=risk_level,
            recommendations=recommendations,
            confidence=round(confidence, 3),
        )


risk_service = RiskAnalysisService()
