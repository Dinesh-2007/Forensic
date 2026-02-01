import os
import requests
import json
import logging
from typing import Dict, List

logger = logging.getLogger("ai_engine")

class LLMAnalyzer:
    """
    AI Engine powered by OpenRouter (DeepSeek/GPT-4)
    Analyzes forensic artifacts for patterns and threats.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Using a reliable, cost-effective model for forensic analysis
        self.model = "mistralai/mistral-7b-instruct:free" 
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

    def analyze_artifacts(self, artifacts: Dict) -> Dict:
        """
        Send scraped artifacts to LLM for comprehensive threat analysis
        """
        try:
            # Prepare context (truncate if too large)
            context = self._prepare_context(artifacts)
            
            prompt = f"""
            You are a Senior Cyber Forensic Analyst. Analyze the following system artifacts for compromise indicators.
            
            ARTIFACTS:
            {json.dumps(context, indent=2)}
            
            TASK:
            1. Identify top 3 security risks.
            2. Flag any specific suspicious processes or registry keys.
            3. Rate overall system risk (LOW/MEDIUM/HIGH/CRITICAL).
            4. Provide actionable remediation steps.
            
            OUTPUT FORMAT (JSON):
            {{
                "risk_level": "HIGH",
                "risk_score": 85,
                "summary": "Short summary...",
                "threats": [
                    {{"type": "Process", "details": "cmd.exe spawned by explorer.exe", "severity": "Medium"}}
                ],
                "recommendations": ["Isolate host", "Kill PID 1234"]
            }}
            """
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3 # Low temperature for factual analysis
            }
            
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                # Parse JSON from LLM response
                return self._parse_llm_response(content)
            else:
                logger.error(f"LLM API Error: {response.text}")
                return {"error": "AI Analysis Service Unavailable"}
                
        except Exception as e:
            logger.error(f"AI Engine Error: {str(e)}")
            return {"error": str(e)}

    def _prepare_context(self, artifacts: Dict) -> Dict:
        """Summarize artifacts to fit context window"""
        summary = {}
        
        # Processes: Extract names and parent/child relationships
        if "processes" in artifacts:
            procs = artifacts["processes"].get("root_processes", [])
            summary["processes"] = [
                f"{p['name']} (PID: {p['pid']})" for p in procs[:20] # Top 20 root processes
            ]
            
        # Registry: Run keys
        if "registry" in artifacts:
             summary["registry"] = artifacts["registry"].get("run_keys", [])[:10]
             
        # Event Logs: Critical only
        if "event_logs" in artifacts:
            summary["events"] = [
                f"{e.get('event_id', 'Unknown')}: {e.get('message', '')[:50]}" 
                for e in artifacts["event_logs"].get("critical_events", [])[:10]
            ]
            
        return summary

    def _parse_llm_response(self, content: str) -> Dict:
        """Extract JSON from potential markdown wrapping"""
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            # Fallback if LLM returns unstructured text
            return {
                "risk_level": "UNKNOWN", 
                "risk_score": 0, 
                "summary": content[:200] + "..."
            }
